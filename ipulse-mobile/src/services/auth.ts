import * as SecureStore from 'expo-secure-store';

export const saveSessionToken = async (token: string) => {
  await SecureStore.setItemAsync('sessionToken', token);
};

export const getSessionToken = async () => {
  return await SecureStore.getItemAsync('sessionToken');
};

export const clearSessionToken = async () => {
  await SecureStore.deleteItemAsync('sessionToken');
};
