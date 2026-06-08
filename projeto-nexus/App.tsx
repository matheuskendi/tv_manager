import React, { useEffect, useState } from 'react';
import { Media, Playlist, TVDevice, UserSession } from './types';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import Player from './components/Player';
import axios from "axios";

// Ajuste a URL base da sua API aqui
const API_URL = 'http://172.16.0.34:3000';

const App: React.FC = () => {
  const [medias, setMedias] = useState<Media[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tvs, setTvs] = useState<TVDevice[]>([]);

  // Mudança 1: Lendo o localStorage ao iniciar o app
  const [session, setSession] = useState<UserSession | null>(() => {
    const savedUser = localStorage.getItem('userData');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return JSON.parse(savedUser);
    }
    return null;
  });

  const handleLogin = async (email: string, name: string, password: string) => {
    console.log("1. App recebeu os dados:", { email, name, password });

    try {
      let response;

      if (email) {
        console.log("2. Tentando login como ADMIN...");
        response = await axios.post(`${API_URL}/auth/login`, { email, password });
      } else {
        console.log("2. Tentando login como TV...");
        response = await axios.post(`${API_URL}/tv-devices/login`, {
          name: name,
          password_hash: password
        });
      }

      console.log("3. Resposta da API recebida:", response.data);

      const { access_token, user, device } = response.data;

      // Salva o token
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Mudança 2: Criando o objeto sessionData antes de usar
      const sessionData = {
        id: user?.id || device?.id,
        name: user?.name || device?.name,
        email: user?.email,
        role: email ? 'admin' : 'tv'
      };

      // Atualiza o estado do React
      setSession(sessionData);

      // Salva os dados do usuário no "HD" do navegador
      localStorage.setItem('userData', JSON.stringify(sessionData));

      console.log("4. Sessão atualizada! O React deve mudar a tela agora.");

    } catch (error: any) {
      console.error("ERRO NO LOGIN:", error.response?.data || error.message);
      alert("Falha no login: " + (error.response?.data?.message || "Erro desconhecido"));
    }
  };

  const handleLogout = () => {
    // Mudança 3: Limpando TUDO no logout
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setSession(null);
  };

  useEffect(() => {
    if (session && session.role === 'admin') {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token');
          const config = { headers: { Authorization: `Bearer ${token}` } };

          const [resMedias, resPlaylists, resTvs] = await Promise.all([
            axios.get(`${API_URL}/media`, config),
            axios.get(`${API_URL}/playlists/user/${session.id}`, config),
            axios.get(`${API_URL}/tv-devices`, config)
          ]);

          setMedias(resMedias.data);

          const playlistsFormatadas = resPlaylists.data.map((playlist: any) => ({
            ...playlist,
            mediaIds: playlist.playlist_items ? playlist.playlist_items.map((item: any) => item.media_id) : []
          }));
          setPlaylists(playlistsFormatadas);

          const tvsFormatadas = resTvs.data.map((tv: any) => ({
            ...tv,
            playlistId: tv.playlist_id
          }));
          setTvs(tvsFormatadas);

        } catch (error) {
          console.error("Erro ao carregar dados do banco", error);
        }
      };
      fetchData();
    }
  }, [session]);

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  if (session.role === 'admin') {
    return (
        <AdminDashboard
            medias={medias}
            playlists={playlists}
            tvs={tvs}
            setMedias={setMedias}
            setPlaylists={setPlaylists}
            setTvs={setTvs}
            onLogout={handleLogout}
            session={session}
        />
    );
  }

  if (session.role === 'tv') {
    return (
        <Player
            tvId={session.id}
            onLogout={handleLogout}
        />
    );
  }

  return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Acesso não autorizado ou papel desconhecido</h1>
        <button onClick={handleLogout}>Voltar</button>
      </div>
  );
};

export default App;