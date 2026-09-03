import { createMMKV, MMKV } from "react-native-mmkv";

const globalStorage = createMMKV({ id: "globalStorage" });

const createMMKVStorage = (storage: MMKV) => {
  return {
    setItem: (key: string, value: string): Promise<void> => {
      storage.set(key, value);
      return Promise.resolve();
    },
    getItem: (key: string): Promise<string | null> => {
      const value = storage.getString(key);
      return Promise.resolve(value === undefined ? null : value);
    },
    removeItem: (key: string): Promise<void> => {
      storage.remove(key);
      return Promise.resolve();
    },
  };
};

export { createMMKV, createMMKVStorage, globalStorage };
