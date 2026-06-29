import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { usePlayer, CustomPlaylist, Track } from '@/context/PlayerContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlaylistScreen() {
  const { playlists, deletePlaylist, removeTrackFromPlaylist, playTrack, currentTrack, isPlaying, pauseTrack, resumeTrack } = usePlayer();
  const insets = useSafeAreaInsets();
  
  const [selectedPlaylist, setSelectedPlaylist] = useState<CustomPlaylist | null>(null);

  const renderPlaylistItem = ({ item, index }: { item: CustomPlaylist; index: number }) => {
    return (
      <TouchableOpacity style={styles.playlistItem} onPress={() => setSelectedPlaylist(item)}>
        <LinearGradient
          colors={
            index % 2 === 0 
              ? [Colors.tealGradientStart, Colors.tealGradientEnd]
              : ['#8ff8b4', '#03c6b2']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.playlistArtwork}
        >
          <Ionicons name={index === 0 ? "heart" : "musical-notes"} size={32} color={Colors.onPrimary} />
        </LinearGradient>
        
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.playlistCount}>{item.tracks.length} tracks</Text>
        </View>

        {item.id !== 'favorites' && (
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => deletePlaylist(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.outline} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderTrackItem = ({ item }: { item: Track }) => {
    const isThisPlaying = currentTrack?.id === item.id;
    return (
      <TouchableOpacity 
        style={styles.trackItem}
        onPress={() => {
          if (isThisPlaying) {
            isPlaying ? pauseTrack() : resumeTrack();
          } else {
            playTrack(item);
          }
        }}
      >
        <View style={styles.trackArtworkContainer}>
          <Image source={{ uri: item.artwork }} style={styles.trackArtwork} />
          <View style={[styles.trackArtworkOverlay, (isThisPlaying && isPlaying) && styles.trackArtworkOverlayActive]}>
            <Ionicons 
              name={isThisPlaying && isPlaying ? "pause" : "play"} 
              size={24} 
              color="#fff" 
            />
          </View>
        </View>
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
        </View>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => {
            if (selectedPlaylist) {
              removeTrackFromPlaylist(selectedPlaylist.id, item.id);
              // Update local state so it removes instantly from view
              setSelectedPlaylist({
                ...selectedPlaylist,
                tracks: selectedPlaylist.tracks.filter(t => t.id !== item.id)
              });
            }
          }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.outline} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <Modal visible={!!selectedPlaylist} transparent animationType="slide">
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedPlaylist(null)} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>{selectedPlaylist?.name}</Text>
            <View style={{ width: 28 }} /> 
          </View>

          <FlatList
            data={selectedPlaylist?.tracks || []}
            keyExtractor={(item) => item.id}
            renderItem={renderTrackItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="musical-notes-outline" size={64} color={Colors.outlineVariant} />
                <Text style={styles.emptyText}>This playlist is empty.</Text>
                <Text style={styles.subText}>Add tracks from the home screen.</Text>
              </View>
            }
          />
        </View>
      </Modal>

      <Text style={styles.header}>Your Library</Text>
      
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylistItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={64} color={Colors.outlineVariant} />
            <Text style={styles.emptyText}>Your library is empty.</Text>
            <Text style={styles.subText}>Create a playlist from the home screen.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 32,
    color: Colors.onSurface,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 150, 
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  playlistArtwork: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  playlistTitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 18,
    color: Colors.onSurface,
  },
  playlistCount: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: Colors.outline,
    marginTop: 4,
  },
  moreButton: {
    padding: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 18,
    color: Colors.onSurface,
    marginTop: 16,
  },
  subText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: Colors.outline,
    marginTop: 8,
  },
  
  // Modal Track Styles
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  modalTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 20,
    color: Colors.onSurface,
    flex: 1,
    textAlign: 'center',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  trackArtworkContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
  },
  trackArtwork: {
    width: '100%',
    height: '100%',
  },
  trackArtworkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  trackArtworkOverlayActive: {
    opacity: 1,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  trackTitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: Colors.onSurface,
  },
  trackArtist: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: Colors.outline,
    marginTop: 4,
  }
});
