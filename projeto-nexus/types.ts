export type MediaType = 'image' | 'video';

export interface Media {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  duration: number; // Duration in seconds (only relevant for images)
}

export interface Playlist {
  id: string;
  name: string;
  mediaIds: string[];
}

export interface TVDevice {
  id: string; // Unique ID used for login (e.g., 'tv_reception')
  password: string; // Authentication password
  name: string; // Friendly name
  playlistId: string | null;
}

export type UserRole = 'admin' | 'tv';

export interface UserSession {
  id: string;
  name: string; // 👈 ADICIONE ESTA LINHA AQUI
  email?: string; // (A interrogação significa que é opcional, já que a TV não tem email)
  role: 'admin' | 'tv' | string;
}
