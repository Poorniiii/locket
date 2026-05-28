import type { AppDispatch } from "../store";
import { clearSession } from "../crypto/keyStore";
import { resetPages } from "../features/pageSlice";
import { locked, accountCleared } from "../features/authSlice";

export const lockSession = (dispatch: AppDispatch): void => {
  clearSession();
  dispatch(resetPages());
  dispatch(locked());
};

export const clearLocalAccount = (dispatch: AppDispatch): void => {
  clearSession();
  dispatch(resetPages());
  dispatch(accountCleared());
};
