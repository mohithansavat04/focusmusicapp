import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { usePlayer } from '@/context/PlayerContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, pauseTrack, resumeTrack } = usePlayer();
  const insets = useSafeAreaInsets();

  if (!currentTrack) return null;

  return (
    <View style={[styles.container, { bottom: 80 + insets.bottom }]}>
      <View style={styles.player}>
        
        {/* Progress bar placeholder (33%) */}
        <LinearGradient
          colors={[Colors.tealGradientStart, Colors.tealGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.progressBar}
        />

        <View style={styles.artworkContainer}>
          <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
        </View>
        
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>
            {isPlaying ? 'Playing • ' : 'Paused • '}{currentTrack.artist}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.playButton} 
          onPress={() => isPlaying ? pauseTrack() : resumeTrack()}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={20} 
            color="#000" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 100,
  },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassPanel,
    padding: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: Colors.tealGradientEnd,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    overflow: 'hidden', // to clip the absolute progress bar
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    width: '33%', // Fake progress for now
    zIndex: 10,
  },
  artworkContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 4,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#fff',
  },
  artist: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: Colors.primaryContainer,
    marginTop: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
});
