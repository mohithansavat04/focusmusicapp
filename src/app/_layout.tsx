import { useColorScheme, View } from 'react-native';
import { PlayerProvider } from '@/context/PlayerContext';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Colors } from '@/constants/Colors';

import AppTabs from '@/components/app-tabs';

import MiniPlayer from '@/components/MiniPlayer';

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <PlayerProvider>
        <AppTabs />
        <MiniPlayer />
      </PlayerProvider>
    </View>
  );
}
