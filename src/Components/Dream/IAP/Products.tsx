import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
  isIosStorekit2,
  PurchaseError,
  requestPurchase,
  Sku,
  useIAP,
} from 'react-native-iap';
import {useDispatch, useSelector} from 'react-redux';
import {FILL_CHARGE} from '../../../redux/types';

import {Box, Button, Heading, Row, State} from '../components';
import {
  colors,
  constants,
  contentContainerStyle,
  errorLog,
  theme,
} from '../utils';

export const Products = () => {
  const [success, setSuccess] = useState(false);
  const {
    connected,
    products,
    currentPurchase,
    currentPurchaseError,
    initConnectionError,
    finishTransaction,
    getProducts,
  } = useIAP();

  const handleGetProducts = async () => {
    try {
      await getProducts({skus: constants.productSkus});
    } catch (error) {
      errorLog({message: 'handleGetProducts', error});
    }
  };

  const handleBuyProduct = async (sku: Sku) => {
    try {
      await requestPurchase({sku});
    } catch (error) {
      if (error instanceof PurchaseError) {
        errorLog({message: `[${error.code}]: ${error.message}`, error});
      } else {
        errorLog({message: 'handleBuyProduct', error});
      }
    }
  };

  const dispatch = useDispatch();

  const chargeOrder = useSelector((state: State) => state.dream.chargeOrder);

  useEffect(() => {
    const checkCurrentPurchase = async () => {
      try {
        if (
          (isIosStorekit2() && currentPurchase?.transactionId) ||
          currentPurchase?.transactionReceipt
        ) {
          await finishTransaction({
            purchase: currentPurchase,
            isConsumable: true,
          });

          setSuccess(true);
          dispatch({type: FILL_CHARGE, payload: chargeOrder});
        }
      } catch (error) {
        if (error instanceof PurchaseError) {
          errorLog({message: `[${error.code}]: ${error.message}`, error});
        } else {
          errorLog({message: 'handleBuyProduct', error});
        }
      }
    };

    checkCurrentPurchase();
  }, [currentPurchase, finishTransaction]);

  useEffect(() => {
    handleGetProducts();
  }, []);

  const productID = useSelector((state: State) => state.dream.productID);

  return <Button title="Buy" onPress={() => handleBuyProduct(productID)} />;
};

const styles = StyleSheet.create({
  errorMessage: {
    ...theme.P1,
    color: colors.red,
  },

  successMessage: {
    ...theme.P1,
    colors: colors.green,
  },

  container: {
    marginBottom: 20,
  },
});
