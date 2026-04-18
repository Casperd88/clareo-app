import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet, Modal } from 'react-native';
import { useFonts } from 'expo-font';
import { InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './src/store';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { MainTabs } from './src/navigation/MainTabs';
import { AudioManager } from './src/components';
import { useAppSelector, useAppDispatch } from './src/hooks';
import { fetchOnboardingPreferences } from './src/store/onboardingSlice';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AppContent() {
  const dispatch = useAppDispatch();
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  
  const { isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth
  );
  const { isComplete: onboardingComplete, isLoading: onboardingLoading } = useAppSelector(
    (state) => state.onboarding
  );
  const currentAudiobook = useAppSelector((state) => state.player.currentAudiobook);

  useEffect(() => {
    if (isAuthenticated && !onboardingComplete) {
      dispatch(fetchOnboardingPreferences());
    }
  }, [isAuthenticated, onboardingComplete, dispatch]);

  useEffect(() => {
    if (!currentAudiobook) {
      setShowFullPlayer(false);
    }
  }, [currentAudiobook]);

  const handleExpandPlayer = useCallback(() => {
    setShowFullPlayer(true);
  }, []);

  const handleCollapsePlayer = useCallback(() => {
    setShowFullPlayer(false);
  }, []);

  if (authLoading || (isAuthenticated && onboardingLoading)) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (!onboardingComplete) {
    return <OnboardingScreen />;
  }

  return (
    <>
      <AudioManager />
      <NavigationContainer>
        <MainTabs onExpandPlayer={handleExpandPlayer} />
      </NavigationContainer>
      <Modal
        visible={showFullPlayer && !!currentAudiobook}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCollapsePlayer}
      >
        <PlayerScreen onClose={handleCollapsePlayer} />
      </Modal>
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'MatterSQ-Light': require('./assets/fonts/MatterSQ-Light.ttf'),
    'MatterSQ-Regular': require('./assets/fonts/MatterSQ-Regular.ttf'),
    'MatterSQ-Medium': require('./assets/fonts/MatterSQ-Medium.ttf'),
    'MatterSQ-Bold': require('./assets/fonts/MatterSQ-Bold.ttf'),
    'InstrumentSerif-Italic': InstrumentSerif_400Regular_Italic,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <AppContent />
          </SafeAreaProvider>
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0A',
  },
});
