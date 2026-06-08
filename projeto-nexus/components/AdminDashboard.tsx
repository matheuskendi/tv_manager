import React, { useState, useRef, useEffect } from 'react';
import { Media, Playlist, TVDevice } from '../types';
import {
  LayoutDashboard, ImageIcon, ListMusic, MonitorPlay,
  Plus, Trash2, Play, LogOut, Check, Upload,
  Loader2, ArrowUp, ArrowDown, Pencil
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://172.16.0.34:3000';

// 🚀 ADICIONADO: Configuração do Interceptador Global do Axios
// Isso garante que se o token expirar enquanto você estiver em outra aba,
// o sistema redirecione para o login assim que você tentar qualquer ação.
axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/'; // Redireciona para a tela de login
      }
      return Promise.reject(error);
    }
);

interface AdminProps {
  medias: Media[];
  playlists: Playlist[];
  tvs: TVDevice[];
  setMedias: React.Dispatch<React.SetStateAction<Media[]>>;
  setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
  setTvs: React.Dispatch<React.SetStateAction<TVDevice[]>>;
  onLogout: () => void;
  session: any;
}

type Tab = 'media' | 'playlists' | 'tvs';

const AdminDashboard: React.FC<AdminProps> = ({
                                                medias, playlists, tvs, setMedias, setPlaylists, setTvs, onLogout, session
                                              }) => {
  const [activeTab, setActiveTab] = useState<Tab>('media');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ name: '', type: 'image', url: '', duration: 10 });
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [editMediaForm, setEditMediaForm] = useState({ name: '', duration: 10 });

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [newTvId, setNewTvId] = useState('');
  const [newTvPassword, setNewTvPassword] = useState('');
  const [newTvName, setNewTvName] = useState('');

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // 🚀 ADICIONADO: Redirecionamento preventivo caso o token suma do localStorage
      window.location.href = '/';
      throw new Error('Token não encontrado');
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const config = getAuthConfig();
        const [mediaRes, playlistRes, tvRes] = await Promise.all([
          axios.get(`${API_URL}/media`, config),
          axios.get(`${API_URL}/playlists/user/${session.id}`, config),
          axios.get(`${API_URL}/tv-devices`, config)
        ]);

        setMedias(mediaRes.data);
        setPlaylists(playlistRes.data.map((p: any) => ({
          ...p,
          mediaIds: p.playlist_items?.map((item: any) => item.media_id) || []
        })));
        setTvs(tvRes.data.map((tv: any) => ({ ...tv, playlistId: tv.playlist_id })));
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    };

    if (medias.length === 0) fetchAllData();
  }, []);

  const moveMediaInPlaylist = async (playlistId: string, index: number, direction: 'up' | 'down') => {
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    if (playlistIndex === -1) return;

    const playlist = playlists[playlistIndex];
    const newMediaIds = [...(playlist.mediaIds || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newMediaIds.length) return;

    [newMediaIds[index], newMediaIds[targetIndex]] = [newMediaIds[targetIndex], newMediaIds[index]];

    const newPlaylists = [...playlists];
    newPlaylists[playlistIndex] = { ...playlist, mediaIds: newMediaIds };
    setPlaylists(newPlaylists);

    try {
      await axios.patch(`${API_URL}/playlists/${playlistId}`, { mediaIds: newMediaIds }, getAuthConfig());
    } catch (error) {
      alert("Erro ao salvar ordem.");
    }
  };

  const toggleMediaInPlaylist = async (playlistId: string, mediaId: string) => {
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    if (playlistIndex === -1) return;

    const playlist = playlists[playlistIndex];
    const safeMediaIds = playlist.mediaIds || [];
    const isIn = safeMediaIds.includes(mediaId);
    const newMediaIds = isIn ? safeMediaIds.filter(id => id !== mediaId) : [...safeMediaIds, mediaId];

    const newPlaylists = [...playlists];
    newPlaylists[playlistIndex] = { ...playlist, mediaIds: newMediaIds };
    setPlaylists(newPlaylists);

    try {
      await axios.patch(`${API_URL}/playlists/${playlistId}`, { mediaIds: newMediaIds }, getAuthConfig());
    } catch (error) {
      alert("Erro ao salvar mídia.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const config = getAuthConfig();
      const response = await axios.post(`${API_URL}/media/upload`, formDataObj, config);
      const uploadedData = response.data;

      setFormData(prev => ({
        ...prev,
        url: uploadedData.url,
        type: uploadedData.type,
        name: prev.name || uploadedData.name,
        duration: uploadedData.type === 'video' ? 0 : 10
      }));

    } catch (error) {
      console.error("Erro no upload local:", error);
      alert("Falha ao enviar o arquivo para o servidor.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/media`, { ...formData, admin_id: session.id }, getAuthConfig());
      setMedias([...medias, response.data]);
      setFormData({ name: '', type: 'image', url: '', duration: 10 });
    } catch (error) {
      alert('Erro ao cadastrar.');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta mídia?")) return;
    await axios.delete(`${API_URL}/media/${id}`, getAuthConfig());
    setMedias(prev => prev.filter(m => m.id !== id));
  };

  const handleEditMediaClick = (media: Media) => {
    setEditingMediaId(media.id);
    setEditMediaForm({ name: media.name, duration: media.duration || 10 });
  };

  const handleUpdateMedia = async (id: string) => {
    try {
      await axios.patch(`${API_URL}/media/${id}`, editMediaForm, getAuthConfig());
      setMedias(prev => prev.map(m => m.id === id ? { ...m, ...editMediaForm } : m));
      setEditingMediaId(null);
    } catch (error) {
      alert('Erro ao atualizar mídia.');
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await axios.post(`${API_URL}/playlists`, { name: newPlaylistName, created_by: session.id }, getAuthConfig());
    setPlaylists([...playlists, { ...response.data, mediaIds: [] }]);
    setNewPlaylistName('');
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!confirm("Deletar playlist?")) return;
    await axios.delete(`${API_URL}/playlists/${id}`, getAuthConfig());
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const handleAddTv = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🛡️ BLINDAGEM: Remove espaços das pontas, troca espaços no meio por traço (-) e deixa tudo minúsculo
    const safeId = newTvId.trim().replace(/\s+/g, '-').toLowerCase();

    try {
      const response = await axios.post(`${API_URL}/tv-devices`, {
        id: safeId, // 👈 Agora o NestJS recebe o ID limpo e seguro
        name: newTvName,
        password_hash: newTvPassword,
        admin_id: session.id
      }, getAuthConfig());

      setTvs([...tvs, response.data]);
      setNewTvId(''); setNewTvName(''); setNewTvPassword('');
    } catch (error) {
      console.error("Erro ao cadastrar TV:", error);
      alert("Erro ao registrar a TV. Verifique se este ID já está sendo usado.");
    }
  };

  const handleDeleteTv = async (id: string) => {
    if (!confirm("Remover TV?")) return;
    await axios.delete(`${API_URL}/tv-devices/${id}`, getAuthConfig());
    setTvs(prev => prev.filter(t => t.id !== id));
  };

  const handleAssignPlaylist = async (tvId: string, playlistId: string) => {
    await axios.patch(`${API_URL}/tv-devices/${tvId}`, { playlist_id: playlistId }, getAuthConfig());
    setTvs(prev => prev.map(tv => tv.id === tvId ? { ...tv, playlistId } : tv));
  };

  return (
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

        {/* SIDEBAR */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 transition-all">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Endomarketing</span>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
                onClick={() => setActiveTab('media')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'media' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
            >
              <ImageIcon className="w-5 h-5" />
              <span>Media Library</span>
            </button>

            <button
                onClick={() => setActiveTab('playlists')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'playlists' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
            >
              <ListMusic className="w-5 h-5" />
              <span>Playlists</span>
            </button>

            <button
                onClick={() => setActiveTab('tvs')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'tvs' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
            >
              <MonitorPlay className="w-5 h-5" />
              <span>Devices (TVs)</span>
            </button>
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 capitalize">{activeTab} Manager</h1>
            <p className="text-slate-500 mt-1">Gerencie os conteúdos da Endomarketing.</p>
          </header>

          {/* --- ABA: MEDIA LIBRARY --- */}
          {activeTab === 'media' && (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-500" />
                    Add New Media
                  </h2>

                  <form onSubmit={handleMediaSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          type="text"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-slate-300"
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-slate-700 mb-1">File Upload</label>
                      <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*,video/*"
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer ${isUploading ? 'bg-slate-100' : 'hover:bg-slate-50 border-slate-300 text-slate-600'}`}
                        >
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {formData.url ? 'Loaded' : 'Upload'}
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                      <select
                          value={formData.type}
                          onChange={e => setFormData({ ...formData, type: e.target.value, duration: e.target.value === 'video' ? 0 : 10 })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-slate-300"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Secs</label>
                      {formData.type === 'video' ? (
                          <input
                              type="text"
                              disabled
                              value="Auto"
                              className="w-full px-4 py-2 border rounded-lg bg-slate-100 text-slate-500 border-slate-300 text-center font-medium cursor-not-allowed"
                          />
                      ) : (
                          <input
                              type="number"
                              min="1"
                              value={formData.duration}
                              onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                              className="w-full px-4 py-2 border rounded-lg bg-white border-slate-300"
                          />
                      )}
                    </div>

                    <div className="md:col-span-1">
                      <button
                          type="submit"
                          disabled={isUploading || !formData.url}
                          className={`w-full h-[42px] text-white rounded-lg flex items-center justify-center ${isUploading || !formData.url ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {medias.map(media => (
                      <div key={media.id} className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-slate-100 relative">
                          {media.type === 'image' ? (
                              <img src={media.url} className="w-full h-full object-cover" />
                          ) : (
                              <>
                                <video
                                    src={`${media.url}#t=0.1`}
                                    className="w-full h-full object-cover"
                                    preload="metadata"
                                    muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <Play className="w-10 h-10 text-white opacity-80" fill="currentColor" />
                                </div>
                              </>
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded capitalize">{media.type}</span>
                          </div>
                        </div>

                        <div className="p-4">
                          {editingMediaId === media.id ? (
                              <div className="space-y-3 animate-fade-in">
                                <div>
                                  <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Nome</label>
                                  <input
                                      type="text"
                                      value={editMediaForm.name}
                                      onChange={e => setEditMediaForm({...editMediaForm, name: e.target.value})}
                                      className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                  />
                                </div>

                                {media.type === 'image' && (
                                    <div>
                                      <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Duração (Segundos)</label>
                                      <input
                                          type="number"
                                          min="1"
                                          value={editMediaForm.duration}
                                          onChange={e => setEditMediaForm({...editMediaForm, duration: Number(e.target.value)})}
                                          className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                      />
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end pt-2">
                                  <button onClick={() => setEditingMediaId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors">Cancelar</button>
                                  <button onClick={() => handleUpdateMedia(media.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded transition-colors flex items-center gap-1"><Check className="w-3 h-3"/> Salvar</button>
                                </div>
                              </div>
                          ) : (
                              <div className="flex items-start justify-between">
                                <div className="overflow-hidden pr-2">
                                  <h3 className="font-semibold text-slate-800 truncate" title={media.name}>{media.name}</h3>
                                  {media.type === 'image' && <p className="text-xs text-slate-500 font-medium">{media.duration || 10} segundos</p>}
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <button onClick={() => handleEditMediaClick(media)} className="text-indigo-500 hover:bg-indigo-50 p-1.5 rounded-full transition-colors">
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteMedia(media.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* --- ABA: PLAYLISTS --- */}
          {activeTab === 'playlists' && (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-500" />
                    Create Playlist
                  </h2>
                  <form onSubmit={handleCreatePlaylist} className="flex gap-4">
                    <input
                        type="text"
                        value={newPlaylistName}
                        onChange={e => setNewPlaylistName(e.target.value)}
                        placeholder="Ex: Campanha de Inverno"
                        required
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-slate-300"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Create
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {playlists.map(playlist => {
                    const safeMediaIds = playlist.mediaIds || [];

                    return (
                        <div key={playlist.id} className={`bg-white rounded-xl shadow-sm border transition-all ${editingPlaylistId === playlist.id ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200'}`}>
                          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-lg text-slate-800">{playlist.name}</h3>
                              <p className="text-sm text-slate-500">{safeMediaIds.length} items</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                  onClick={() => setEditingPlaylistId(editingPlaylistId === playlist.id ? null : playlist.id)}
                                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${editingPlaylistId === playlist.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                              >
                                {editingPlaylistId === playlist.id ? 'Done' : 'Edit Order'}
                              </button>
                              <button
                                  onClick={() => handleDeletePlaylist(playlist.id)}
                                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {editingPlaylistId === playlist.id ? (
                              <div className="p-5 bg-slate-50 space-y-6">
                                <div>
                                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Exibition Order (Visual)</p>
                                  <div className="space-y-2">
                                    {safeMediaIds.map((id, index) => {
                                      const m = medias.find(md => md.id === id);
                                      if (!m) return null;

                                      return (
                                          <div key={id} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 transition-colors">
                                            <div className="flex items-center gap-3">
                                              <div className="w-16 h-10 bg-slate-100 rounded overflow-hidden border border-slate-200 flex-shrink-0 relative">
                                                {m.type === 'image' ? (
                                                    <img src={m.url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                      <video
                                                          src={`${m.url}#t=0.1`}
                                                          className="w-full h-full object-cover"
                                                          preload="metadata"
                                                          muted
                                                      />
                                                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                        <Play className="w-4 h-4 text-white" fill="currentColor" />
                                                      </div>
                                                    </>
                                                )}
                                              </div>
                                              <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-mono text-slate-400 uppercase">Pos #{index+1}</span>
                                                <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{m.name}</span>
                                              </div>
                                            </div>
                                            <div className="flex gap-1">
                                              <button
                                                  onClick={() => moveMediaInPlaylist(playlist.id, index, 'up')}
                                                  disabled={index === 0}
                                                  className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-20 text-slate-600 transition-colors"
                                              >
                                                <ArrowUp size={16} />
                                              </button>
                                              <button
                                                  onClick={() => moveMediaInPlaylist(playlist.id, index, 'down')}
                                                  disabled={index === safeMediaIds.length - 1}
                                                  className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-20 text-slate-600 transition-colors"
                                              >
                                                <ArrowDown size={16} />
                                              </button>
                                            </div>
                                          </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <hr className="border-slate-200" />

                                <div>
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Add / Remove Media</p>
                                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                                    {medias.map(m => {
                                      const selected = safeMediaIds.includes(m.id);
                                      return (
                                          <div
                                              key={m.id}
                                              onClick={() => toggleMediaInPlaylist(playlist.id, m.id)}
                                              className={`flex items-center p-2 rounded-lg cursor-pointer border ${selected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}
                                          >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                              {selected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="text-sm truncate">{m.name}</span>
                                          </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                          ) : (
                              <div className="p-5 flex -space-x-2 overflow-hidden">
                                {safeMediaIds.slice(0, 8).map(id => {
                                  const m = medias.find(md => md.id === id);
                                  return m ? (
                                      <div key={id} className="h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden">
                                        {m.type === 'image' ? (
                                            <img src={m.url} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-slate-800 flex items-center justify-center">
                                              <Play className="w-3 h-3 text-white"/>
                                            </div>
                                        )}
                                      </div>
                                  ) : null;
                                })}
                              </div>
                          )}
                        </div>
                    );
                  })}
                </div>
              </div>
          )}

          {/* --- ABA: TVs --- */}
          {activeTab === 'tvs' && (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <MonitorPlay className="w-5 h-5 text-indigo-500" />
                    Register Device
                  </h2>
                  <form onSubmit={handleAddTv} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Device ID</label>
                      <input
                          required
                          value={newTvId}
                          onChange={e => setNewTvId(e.target.value)}
                          type="text"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-slate-300 font-mono"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Device Name</label>
                      <input
                          required
                          value={newTvName}
                          onChange={e => setNewTvName(e.target.value)}
                          type="text"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-slate-300"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Pass-key</label>
                      <input
                          required
                          value={newTvPassword}
                          onChange={e => setNewTvPassword(e.target.value)}
                          type="password"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none border-slate-300"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                          type="submit"
                          className="w-full h-[42px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                      >
                        Register
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Device Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Active Playlist</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {tvs.map(tv => (
                        <tr key={tv.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tv.playlistId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {tv.playlistId ? 'Active' : 'Stand-by'}
                        </span>
                          </td>
                          <td className="px-6 py-4 font-medium">{tv.name}</td>
                          <td className="px-6 py-4">
                            <select
                                value={tv.playlistId || ''}
                                onChange={(e) => handleAssignPlaylist(tv.id, e.target.value)}
                                className="w-full p-1 text-sm border-slate-300 rounded-md bg-transparent"
                            >
                              <option value="">-- Select Playlist --</option>
                              {playlists.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                                onClick={() => handleDeleteTv(tv.id)}
                                className="text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
          )}
        </main>
      </div>
  );
};

export default AdminDashboard;