const DB_NAME = "locket";
const DB_VERSION = 1;
const STORE = "account";
const ACCOUNT_ID = 1;

export interface AccountRecord {
  id: number;
  version: number;
  salt: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
}

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runTx = <T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>
): Promise<T> =>
  openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const store = tx.objectStore(STORE);
        let result: T;
        Promise.resolve(work(store))
          .then((value) => {
            if (value instanceof IDBRequest) {
              value.onsuccess = () => {
                result = value.result as T;
              };
              value.onerror = () => reject(value.error);
            } else {
              result = value;
            }
          })
          .catch(reject);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );

export const getAccount = async (): Promise<AccountRecord | undefined> => {
  return runTx("readonly", (store) => {
    return new Promise<AccountRecord | undefined>((resolve, reject) => {
      const req = store.get(ACCOUNT_ID);
      req.onsuccess = () => resolve(req.result as AccountRecord | undefined);
      req.onerror = () => reject(req.error);
    });
  });
};

export const saveAccount = async (
  record: Omit<AccountRecord, "id">
): Promise<void> => {
  await runTx("readwrite", (store) => {
    return new Promise<void>((resolve, reject) => {
      const req = store.put({ ...record, id: ACCOUNT_ID });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
};

export const clearAccount = async (): Promise<void> => {
  await runTx("readwrite", (store) => {
    return new Promise<void>((resolve, reject) => {
      const req = store.delete(ACCOUNT_ID);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
};

export const isStorageAvailable = (): boolean =>
  typeof indexedDB !== "undefined";
