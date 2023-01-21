import React from 'react';
import {withIAPContext} from 'react-native-iap';

import {ClassSetup, Products} from './IAP';

const PurchaseComponent = withIAPContext(Products);

export const IAP = () => {
  return <PurchaseComponent />;
};
