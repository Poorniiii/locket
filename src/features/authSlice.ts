import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Profile {
  name: string;
}

export type AuthStatus =
  | "booting"
  | "no-account"
  | "locked"
  | "unlocked"
  | "unavailable";

interface AuthState {
  status: AuthStatus;
  profile: Profile | null;
  error: string | null;
}

const initialState: AuthState = {
  status: "booting",
  profile: null,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    bootResolved: (
      state,
      action: PayloadAction<{ hasAccount: boolean; available: boolean }>
    ) => {
      if (!action.payload.available) {
        state.status = "unavailable";
      } else {
        state.status = action.payload.hasAccount ? "locked" : "no-account";
      }
      state.error = null;
    },
    unlocked: (state, action: PayloadAction<Profile>) => {
      state.status = "unlocked";
      state.profile = action.payload;
      state.error = null;
    },
    locked: (state) => {
      state.status = "locked";
      state.profile = null;
      state.error = null;
    },
    accountCleared: (state) => {
      state.status = "no-account";
      state.profile = null;
      state.error = null;
    },
    authError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  }
});

export const {
  bootResolved,
  unlocked,
  locked,
  accountCleared,
  authError,
  clearAuthError
} = authSlice.actions;

export default authSlice.reducer;
