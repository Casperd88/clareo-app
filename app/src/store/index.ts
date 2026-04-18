import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import playerReducer from "./playerSlice";
import onboardingReducer from "./onboardingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    player: playerReducer,
    onboarding: onboardingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
