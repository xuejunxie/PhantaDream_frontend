import React from 'react';
import {MoralisProvider} from 'react-moralis';
import Moralis from 'moralis-v1/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import Qrcode from "./Qrcode";
//import { expo } from "../app.json";
// import { REACT_APP_MORALIS_APPLICATION_ID, REACT_APP_MORALIS_SERVER_URL } from "@env";

interface ProvidersProps {
  readonly children: JSX.Element;
}

/**
 * Initialization of Moralis
 */
// const appId = REACT_APP_MORALIS_APPLICATION_ID;
// const serverUrl = REACT_APP_MORALIS_SERVER_URL;
const appId = '2JR5Ic6DErCt5TRFGxBsDPB6Qkn07RyH7g5yYg0H';
const serverUrl = 'https://eeeurthen3ua.usemoralis.com:2053/server';
const environment = 'native';

// Initialize Moralis with AsyncStorage to support react-native storage
Moralis.setAsyncStorage(AsyncStorage);
// Replace the enable function to use the react-native WalletConnect
// @ts-ignore
// Moralis.enable = enableViaWalletConnect;
// console.log(AsyncStorage.getAllKeys(), 'KEYS');

export const Providers = ({children}: ProvidersProps) => {
  return (
    <MoralisProvider
      appId={appId}
      serverUrl={serverUrl}
      environment={environment}>
      {children}
    </MoralisProvider>
  );
};
