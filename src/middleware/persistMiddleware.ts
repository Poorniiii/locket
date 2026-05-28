import type { Middleware } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { encryptJson, generateIv } from "../crypto/encryption";
import { getKey, getSalt } from "../crypto/keyStore";
import { saveAccount } from "../storage/db";

const MUTATING_PAGE_ACTIONS = new Set([
  "pages/addPage",
  "pages/updatePage",
  "pages/deletePage",
  "pages/sortPages"
]);

const persist = async (state: RootState): Promise<void> => {
  const key = getKey();
  const salt = getSalt();
  if (!key || !salt) return;
  if (state.auth.status !== "unlocked" || !state.auth.profile) return;

  const blob = {
    profile: state.auth.profile,
    pages: state.pages.pageData
  };
  const iv = generateIv();
  const ciphertext = await encryptJson(blob, key, iv);
  await saveAccount({ version: 1, salt, iv, ciphertext });
};

export const persistMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const a = action as { type?: string };
  if (typeof a.type === "string" && MUTATING_PAGE_ACTIONS.has(a.type)) {
    persist(store.getState() as RootState).catch((err) => {
      console.error("Failed to persist diary:", err);
    });
  }
  return result;
};
