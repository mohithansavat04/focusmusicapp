import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions, Modal } from 'react-native';
import { usePlayer, Track } from '@/context/PlayerContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

import { Platform } from 'react-native';

const getApiUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000';
  const hostUri = Constants.expoConfig?.hostUri;
  const localhost = hostUri ? hostUri.split(':')[0] : '127.0.0.1';
  return `http://${localhost}:5000`;
};

const genres = [
  { id: '1', title: 'Acoustic', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0xB_yhSm12cPn2C44_ey3B3V7VxudM82ZzJhi6yvMyL5N0RGYYilx9xSsKBM8B4a1jnvOfUKnFpTIm3S2UChdDNXkW63nhMAJyJUSmUH0vH7FStiABxS2O0w25klogL6hD5YaEaxabqpk_pjNbYozPt8Ju7Bdqn5L2-i4FRGmmZya7Jdz0DXLmoAxKK9wDEtIXl554ugCbtf5W-DOEpPRRKfFW7XD_poSfPer8UD5wVBS4uQqTinJu8uSHj48yLQDTUGtgLX1bFGU' },
  { id: '2', title: 'Drone', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTRrWaMB9AiShFSIV6auk8hC9-R8nGvPW7B7gtpTiVpoZDPsy7e_GdX5LJfqpPnqxW3B1qlsekQ3reNNa8U0kDobS9QK457EeDrYkvaN4TUUoXyFgb7wXeGhX8Zb0nZ0UfxwaVZkZ_mtVSNq5xPMWRm26HSZfRdjPIaDYGOL7iVX2eWmqa7IrstTC8tooFwb1SeEbkEdQq6ZSLb8MYVLHxV7ammjhIe2HnmhzBG4ewqeF9_PgAp49aRGxjysfqpxQLPlIpqRfY43fU' },
  { id: '3', title: 'Rain', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp_ikkB7b_hXqb6795OoJ3iHH8jyhhGty3KzhJ8BntYbsw6Es7b78V8jr_2jC0led_nEZTSJ603kVxQ0myQUT3XLdfhpL5qOzaxrwXU2rZtn5TdZCCur3f2H8EKgHmGwgeTAMCv1HUWz6hHTb0dXD5sGvFtMyFw-M5Fo2fiV-Cj2wgiiSnl7U1QRk-6fQYSSFywSy0olXOPdGe-_LtvAj1spAkv2DaoX7f9uWaNi3XlSoaWkGaiiUfX4zDU3luUSd-65R_D6jaMnj0' },
  { id: '4', title: 'Forest', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMl1gmcNw3uSHOeW2ijxaX-iqC_FW86HXz2IBbCQ81_jdp_fgBihX1-JqipbL7GF2hCksuI024c3I7oal1zq13ABzdrp80VUQJTs2z0R8wQwdAN8PKUCtqurlSpxp7KZuv1wk-uGhKvzBmTgqS5-EE9c7DIaIfrkPcBFnjkeenZtgU0QzI8TPJ18bqokdyo0bRY83USXdIu4ju1cD_R9VslcnRvjkBaLituoClGpQ06m4dTjit1eP5nVztz-8i3Iba25XaTSPypyGQ' }
];

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const { playTrack, currentTrack, isPlaying, pauseTrack, resumeTrack, playlists, createPlaylist, addTrackToPlaylist } = usePlayer();
  const insets = useSafeAreaInsets();

  // Modals state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const fetchTracks = async (searchQuery = '') => {
    setLoading(true);
    try {
      const url = `${getApiUrl()}/api/tracks${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      const mappedData = data.map((track: Track) => ({
        ...track,
        previewUrl: track.previewUrl?.startsWith('/') ? `${getApiUrl()}${track.previewUrl}` : track.previewUrl
      }));
      setResults(mappedData);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTracks(query);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim().length > 0) {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setCreateModalVisible(false);
    }
  };

  const handleOpenOptions = (track: Track) => {
    setSelectedTrack(track);
    setOptionsModalVisible(true);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (selectedTrack) {
      await addTrackToPlaylist(playlistId, selectedTrack);
      setOptionsModalVisible(false);
      setSelectedTrack(null);
    }
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
        <TouchableOpacity style={styles.moreButton} onPress={() => handleOpenOptions(item)}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.outline} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Create Playlist Modal */}
      <Modal visible={createModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Playlist name"
              placeholderTextColor={Colors.outline}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleCreatePlaylist}>
                <Text style={styles.modalBtnTextPrimary}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Track Options Modal */}
      <Modal visible={optionsModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOptionsModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.modalTitle}>Add to Playlist</Text>
            
            <ScrollView style={{ maxHeight: 300, width: '100%', marginTop: 16 }}>
              {playlists.map(p => (
                <TouchableOpacity key={p.id} style={styles.sheetOption} onPress={() => handleAddToPlaylist(p.id)}>
                  <Ionicons name="list" size={24} color={Colors.outline} />
                  <Text style={styles.sheetOptionText}>{p.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.sheetOption} onPress={() => {
                setOptionsModalVisible(false);
                setCreateModalVisible(true);
              }}>
                <Ionicons name="add" size={24} color={Colors.primaryContainer} />
                <Text style={[styles.sheetOptionText, { color: Colors.primaryContainer }]}>Create New Playlist</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoXC3rxrBb3NpNG-sr3Ab1xcnkfpFWEQC-g-bKlG4G3uSDTGOljIRfasB5IG4pqTC4TkBMyd1L3n7qLhxInm4q2g8Um1sYcrY_XAH-OYmXN45cRblKB0zP3myYNJ-cZ0d73scCdDnNs3YV6XRFjadtllQIi7nBoFPc5mGHS-Zf3DgbuNnlIEBtupuwUpiO9pJ4YrxvgVdnDXmm1HVyiYTeZnLNVZun2IW5pp-8ng-HFWvf_x-8YcgciO3uiSmgdibRUDI_Si1Yya4f' }} 
            style={styles.profilePic} 
          />
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.outline} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for songs and artists"
              placeholderTextColor={Colors.outline}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Genres */}
        {query.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genres</Text>
            {genres.map(genre => (
              <TouchableOpacity key={genre.id} style={styles.genreCard}>
                <View style={styles.genreCardInner}>
                  <Image source={{ uri: genre.image }} style={styles.genreImage} />
                  <Text style={styles.genreText}>{genre.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={Colors.outline} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Playlists */}
        {query.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Playlists</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              
              {/* Render dynamic user playlists */}
              {playlists.map((playlist, index) => (
                <LinearGradient
                  key={playlist.id}
                  colors={
                    index % 2 === 0 
                      ? [Colors.tealGradientStart, Colors.tealGradientEnd]
                      : ['#8ff8b4', '#03c6b2'] // alternative gradient for variety
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playlistTile}
                >
                  <Ionicons name={index === 0 ? "heart" : "list"} size={32} color={Colors.onPrimary} />
                  <Text style={styles.playlistTileText}>{playlist.name}</Text>
                  <Text style={styles.playlistTileCount}>{playlist.tracks.length} tracks</Text>
                </LinearGradient>
              ))}
              
              <TouchableOpacity style={styles.createTile} onPress={() => setCreateModalVisible(true)}>
                <Ionicons name="add" size={32} color={Colors.outline} />
                <Text style={styles.createTileText}>Create</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Recently Played / Search Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {query.length > 0 ? 'Search Results' : 'Recently Played'}
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primaryContainer} style={{ marginTop: 20 }} />
          ) : (
            results.map(item => (
              <React.Fragment key={item.id}>
                {renderTrackItem({ item })}
              </React.Fragment>
            ))
          )}
          {!loading && results.length === 0 && (
            <Text style={{ color: Colors.outline, marginTop: 20 }}>No results found.</Text>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 150, 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 16,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  searchContainer: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    height: '100%',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 24,
    color: Colors.onSurface,
    marginBottom: 16,
  },
  genreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  genreCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  genreImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  genreText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 18,
    color: Colors.onSurface,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    overflow: 'visible',
  },
  playlistTile: {
    width: 128,
    height: 128,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  playlistTileText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: Colors.onPrimary,
    marginTop: 8,
  },
  playlistTileCount: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: Colors.onPrimary,
    opacity: 0.8,
    marginTop: 2,
  },
  createTile: {
    width: 128,
    height: 128,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
  },
  createTileText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: Colors.outline,
    marginTop: 8,
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
  },
  moreButton: {
    padding: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  modalTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 20,
    color: Colors.onSurface,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    color: Colors.onSurface,
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
  },
  modalBtnPrimary: {
    backgroundColor: Colors.primaryContainer,
  },
  modalBtnText: {
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.onSurface,
    fontSize: 16,
  },
  modalBtnTextPrimary: {
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.onPrimary,
    fontSize: 16,
  },
  
  // Bottom Sheet Styles
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surfaceContainer,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 50, // safe area padding
    borderTopWidth: 1,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.outlineVariant,
    borderRadius: 2,
    marginBottom: 24,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sheetOptionText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: Colors.onSurface,
    marginLeft: 16,
  }
});
