import { useEffect } from "react";
import { useAppDispatch } from "../hooks";
import { bootResolved } from "../features/authSlice";
import { getAccount, isStorageAvailable } from "../storage/db";

export const useBootAuth = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!isStorageAvailable()) {
        if (!cancelled)
          dispatch(bootResolved({ hasAccount: false, available: false }));
        return;
      }
      try {
        const record = await getAccount();
        if (!cancelled)
          dispatch(
            bootResolved({ hasAccount: !!record, available: true })
          );
      } catch (err) {
        console.error("Failed to read account record:", err);
        if (!cancelled)
          dispatch(bootResolved({ hasAccount: false, available: false }));
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);
};
