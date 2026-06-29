import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Track = {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  previewUrl: string;
};

export type CustomPlaylist = {
  id: string;
  name: string;
  tracks: Track[];
};

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => Promise<void>;
  pauseTrack: () => Promise<void>;
  resumeTrack: () => Promise<void>;
  
  playlists: CustomPlaylist[];
  createPlaylist: (name: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
        });
      } catch (e) {
        console.warn('Audio setup error', e);
      }
    };
    setupAudio();
    loadPlaylists();
  }, []);

  useEffect(() => {
    if (status.isLoaded && status.didJustFinish) {
      setIsPlaying(false);
    }
  }, [status.isLoaded, status.didJustFinish]);

  const loadPlaylists = async () => {
    try {
      const data = await AsyncStorage.getItem('customPlaylists');
      if (data) {
        setPlaylists(JSON.parse(data));
      } else {
        // Initialize with a default favorites playlist if empty
        const defaultPlaylist: CustomPlaylist = {
          id: 'favorites',
          name: 'Favorites',
          tracks: []
        };
        setPlaylists([defaultPlaylist]);
        await AsyncStorage.setItem('customPlaylists', JSON.stringify([defaultPlaylist]));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const savePlaylists = async (newPlaylists: CustomPlaylist[]) => {
    setPlaylists(newPlaylists);
    await AsyncStorage.setItem('customPlaylists', JSON.stringify(newPlaylists));
  };

  const createPlaylist = async (name: string) => {
    const newPlaylist: CustomPlaylist = {
      id: Date.now().toString(),
      name,
      tracks: []
    };
    await savePlaylists([...playlists, newPlaylist]);
    Alert.alert('Success', `Playlist "${name}" created!`);
  };

  const deletePlaylist = async (playlistId: string) => {
    const updated = playlists.filter(p => p.id !== playlistId);
    await savePlaylists(updated);
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        if (!p.tracks.find(t => t.id === track.id)) {
          return { ...p, tracks: [...p.tracks, track] };
        }
      }
      return p;
    });
    
    // Check if it was actually added
    const targetPlaylist = updated.find(p => p.id === playlistId);
    const oldPlaylist = playlists.find(p => p.id === playlistId);
    
    if (targetPlaylist?.tracks.length !== oldPlaylist?.tracks.length) {
      await savePlaylists(updated);
      Alert.alert('Added', `Track added to ${targetPlaylist?.name}`);
    } else {
      Alert.alert('Already Added', 'This track is already in the playlist.');
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
      }
      return p;
    });
    await savePlaylists(updated);
  };

  const playTrack = async (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    try {
      player.replace({ uri: track.previewUrl });
      player.play();
    } catch (error) {
      console.error('Error playing sound:', error);
      setIsPlaying(false);
    }
  };

  const pauseTrack = async () => {
    try {
      player.pause();
      setIsPlaying(false);
    } catch (e) {
      console.warn('Error pausing:', e);
    }
  };

  const resumeTrack = async () => {
    try {
      player.play();
      setIsPlaying(true);
    } catch (e) {
      console.warn('Error resuming:', e);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        resumeTrack,
        playlists,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        deletePlaylist
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
