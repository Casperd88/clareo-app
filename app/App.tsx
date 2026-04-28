import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Modal,
  Platform,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { themes } from '@clareo/design-system';
import { useFonts } from 'expo-font';
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
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
import { ThemeProvider, useTheme } from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function readUrlWantsSignUp(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const { search, hash } = window.location;
  const params = new URLSearchParams(search);
  if (
    params.get('signup') === '1' ||
    params.get('signup') === 'true' ||
    params.get('flow') === 'signup'
  ) {
    return true;
  }
  if (hash && hash.length > 1) {
    const h = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    if (h.get('signup') === '1' || h.get('flow') === 'signup') {
      return true;
    }
  }
  return false;
}

function AppContent() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [isSignupFlow, setIsSignupFlow] = useState(() => readUrlWantsSignUp());

  const { isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth
  );
  const {
    isComplete: onboardingComplete,
    isLoading: onboardingLoading,
    isSaving: onboardingSaving,
  } = useAppSelector((state) => state.onboarding);
  const currentAudiobook = useAppSelector((state) => state.player.currentAudiobook);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onChange = () => setIsSignupFlow(readUrlWantsSignUp());
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !onboardingComplete && !onboardingSaving) {
      dispatch(fetchOnboardingPreferences());
    }
  }, [isAuthenticated, onboardingComplete, onboardingSaving, dispatch]);

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
      <View style={[styles.loading, { backgroundColor: theme.colors.bg }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={theme.scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.bg}
      />
      {!isAuthenticated ? (
        isSignupFlow ? (
          <OnboardingScreen
            requiresAccountCreation
            onSignInPress={() => setIsSignupFlow(false)}
          />
        ) : (
          <AuthScreen onCreateAccount={() => setIsSignupFlow(true)} />
        )
      ) : !onboardingComplete ? (
        <OnboardingScreen />
      ) : (
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
      )}
    </>
  );
}

export default function App() {
  const systemScheme = useColorScheme() ?? 'light';
  const fallbackPalette = themes[systemScheme];

  const [fontsLoaded] = useFonts({
    'MatterSQ-Light': require('./assets/fonts/MatterSQ-Light.ttf'),
    'MatterSQ-Regular': require('./assets/fonts/MatterSQ-Regular.ttf'),
    'MatterSQ-Medium': require('./assets/fonts/MatterSQ-Medium.ttf'),
    'MatterSQ-Bold': require('./assets/fonts/MatterSQ-Bold.ttf'),
    'InstrumentSerif-Regular': InstrumentSerif_400Regular,
    'InstrumentSerif-Italic': InstrumentSerif_400Regular_Italic,
  });

  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingFallback, { backgroundColor: fallbackPalette.bg }]}>
        <ActivityIndicator size="large" color={fallbackPalette.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ThemeProvider initialPreference="system">
              <AppContent />
            </ThemeProvider>
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
  },
  loadingFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
