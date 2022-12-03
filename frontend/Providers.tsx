import React from 'react';
//import Qrcode from "./Qrcode";
//import { expo } from "../app.json";

/**
 * Initialization of Moralis
 */

// Initialize Moralis with AsyncStorage to support react-native storage
// Replace the enable function to use the react-native WalletConnect
// @ts-ignore
// Moralis.enable = enableViaWalletConnect;
// console.log(AsyncStorage.getAllKeys(), 'KEYS');

export const Providers = ({children}: ProvidersProps) => {
  return <>{children}</>;
};
