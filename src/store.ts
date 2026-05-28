import { configureStore } from "@reduxjs/toolkit";
import pageReducer from "./features/pageSlice";
import authReducer from "./features/authSlice";
import { persistMiddleware } from "./middleware/persistMiddleware";

export const store = configureStore({
  reducer: {
    pages: pageReducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistMiddleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
