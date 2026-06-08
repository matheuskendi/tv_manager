import React, { useState, useEffect, useRef } from 'react';
import { Media } from '../types';
import { Loader2, WifiOff, LogOut, MonitorOff } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://172.16.0.34:3000';
// Configuração de reconexão automática do Socket
const socket = io(API_URL, { reconnectionAttempts: 5, timeout: 10000 });

interface PlayerProps {
  tvId: string;
  onLogout: () => void;
}

const Player: React.FC<PlayerProps> = ({ tvId, onLogout }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [playlistMedia, setPlaylistMedia] = useState<Media[]>([]);
  const [pendingMedia, setPendingMedia] = useState<Media[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchTVData = async () => {
    if (!tvId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Token não encontrado");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Busca os dados da TV
      const tvRes = await axios.get(`${API_URL}/tv-devices/${tvId}`, config);
      const tv = tvRes.data;

      // 🔍 LOG DE DEBUG: Abra o F12 no navegador e veja o que aparece aqui
      console.log("📺 Dados da TV recebidos:", tv);

      // Tenta pegar o ID da playlist das duas formas possíveis
      const idDaPlaylist = tv.playlist_id || tv.playlistId;

      if (!idDaPlaylist) {
        console.warn("⚠️ Esta TV não tem nenhuma playlist vinculada no banco.");
        setPlaylistMedia([]);
        setLoading(false);
        return;
      }

      // 2. Busca a Playlist usando o ID que encontramos
      const playlistRes = await axios.get(`${API_URL}/playlists/${idDaPlaylist}`, config);
      console.log("🎶 Playlist encontrada:", playlistRes.data);

      const items = playlistRes.data?.playlist_items || [];

// 🚀 A MÁGICA DA ORDEM ESTÁ NESTA LINHA:
      items.sort((a: any, b: any) => a.display_order - b.display_order);

      const mediaPromises = items.map((item: any) =>
          axios.get(`${API_URL}/media/${item.media_id}`, config).catch(() => null)
      );

      const mediaResponses = await Promise.all(mediaPromises);
      const mediasCompletas = mediaResponses
          .filter(res => res !== null && res.data)
          .map(res => res!.data);

      if (playlistMedia.length > 0) {
        setPendingMedia(mediasCompletas);
      } else {
        setPlaylistMedia(mediasCompletas);
      }

      setError(null);
    } catch (err: any) {
      console.error("❌ Erro no fetch:", err);
      setError("Erro ao carregar playlist. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTVData();

    socket.on('connect', () => console.log("📡 Conectado ao Gateway!"));

    socket.on('update_tv', (data) => {
      // Checagem de segurança para o objeto data
      if (data && data.tvId === tvId) {
        console.log("⚡ Atualização detectada!");
        fetchTVData();
      }
    });

    return () => { socket.off('update_tv'); socket.off('connect'); };
  }, [tvId]);

  const handleNext = () => {
    // 1. Se tem uma playlist nova na fila (atualização via socket), troca na hora!
    if (pendingMedia) {
      setPlaylistMedia(pendingMedia);
      setPendingMedia(null);
      setCurrentMediaIndex(0);
      return;
    }

    // 2. 🔁 A MÁGICA AQUI: Se for apenas UM vídeo na playlist
    if (playlistMedia.length === 1) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0; // Rebobina pro segundo zero
        videoRef.current.play().catch(() => {}); // Dá o play de novo na marra
      }
      return; // Para a execução aqui, pois não precisamos mudar o currentMediaIndex
    }

    // 3. Lógica normal: passa para o próximo vídeo se tiver 2 ou mais itens
    if (playlistMedia.length > 0) {
      setCurrentMediaIndex(prev => {
        const nextIndex = prev + 1;
        return nextIndex >= playlistMedia.length ? 0 : nextIndex;
      });
    }
  };

  // Efeito do Canvas (Vídeos)
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const currentItem = playlistMedia[currentMediaIndex];

    if (!video || !canvas || currentItem?.type !== 'video') return;

    const context = canvas.getContext('2d');
    let animationFrame: number;

    const render = () => {
      if (context && video && video.readyState >= 2) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      animationFrame = requestAnimationFrame(render);
    };

    video.play().catch(() => {});
    render();

    return () => { if (animationFrame) cancelAnimationFrame(animationFrame); };
  }, [currentMediaIndex, playlistMedia]);

  // Timer para Imagens
  useEffect(() => {
    const currentItem = playlistMedia[currentMediaIndex];
    if (!currentItem || currentItem.type === 'video') return;

    const duration = (currentItem.duration || 5) * 1000;
    const timer = setTimeout(handleNext, duration);
    return () => clearTimeout(timer);
  }, [currentMediaIndex, playlistMedia]);

  // --- RENDERIZAÇÃO COM GATILHOS DE SEGURANÇA ---

  if (error) return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <WifiOff className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-xl font-bold">{error}</p>
        <button onClick={onLogout} className="mt-6 px-8 py-3 bg-indigo-600 rounded-full font-bold">Voltar para Login</button>
      </div>
  );

  if (loading || !playlistMedia || playlistMedia.length === 0) return (
      <div className="relative min-h-screen bg-black flex flex-col items-center justify-center text-white">

        {/* Botão Logout no canto superior direito (padrão) */}
        <div className="absolute top-4 right-4 z-50 opacity-30 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
              onClick={onLogout}
              className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Sair"
          >
            <LogOut size={24}/>
          </button>
        </div>

        {loading ? (
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        ) : (
            <div className="flex flex-col items-center">
              <MonitorOff className="w-16 h-16 text-slate-700 mb-4" />
              <p className="text-slate-500 mb-6">Aguardando envio de playlist...</p>

              {/* Botão extra no meio da tela para facilitar na TV */}
              <button
                  onClick={onLogout}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 focus:bg-slate-700 text-slate-300 hover:text-white rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                Voltar para Login
              </button>
            </div>
        )}
      </div>
  );

  // Aqui é o ponto crítico: pegamos o item somente APÓS passar por todos os IFs acima
  const currentItem = playlistMedia[currentMediaIndex];

  // Se mesmo assim o item for nulo (ex: índice inválido), mostramos tela preta e pula pro próximo
  if (!currentItem || !currentItem.url) {
    handleNext();
    return <div className="min-h-screen bg-black" />;
  }

  return (
      <div className="relative w-screen h-screen bg-black overflow-hidden">
        <video
            ref={videoRef}
            src={currentItem.type === 'video' ? currentItem.url : undefined}
            muted playsInline autoPlay onEnded={handleNext}
            className={`absolute inset-0 w-full h-full object-cover ${currentItem.type === 'video' ? 'opacity-100' : 'opacity-0'}`}
        />

        {currentItem.type === 'video' ? (
            <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-cover" />
        ) : (
            <img
                src={currentItem.url}
                className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                alt="Display"
                onError={handleNext}
            />
        )}

        {/* Botão Logout Visível e Acessível */}
        <div className="absolute top-4 right-4 z-50 opacity-30 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
              onClick={onLogout}
              className="p-3 bg-black/60 rounded-full text-white hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Sair"
          >
            <LogOut size={24}/>
          </button>
        </div>
      </div>
  );
};

export default Player;