import React, {useEffect} from 'react';
import ApplePay, {DetailsData, MethodData} from 'react-native-apple-payment';
import {TouchableOpacity, View, Button} from 'react-native';
import auth from '@react-native-firebase/auth';
import realtime from '@react-native-firebase/database';

export default function Payment({price, chargeOrder, fillCharge}) {
  const Method: MethodData = {
    countryCode: 'US',
    currencyCode: 'USD',
    merchantIdentifier: 'merchant.phantadream',
    supportedNetworks: ['Visa', 'MasterCard', 'AmEx', 'Discover'],
  };

  const Options: DetailsData = {
    total: {
      label: 'PhantaCharge',
      amount: price,
    },
  };

  const payment = new ApplePay(Method, Options);

  return (
    <View>
      <Button
        title={'Buy'}
        onPress={() => {
          payment.canMakePayments().then((can: any) => {
            if (can) {
              payment.initApplePay().then((res: any) => {
                fillCharge(chargeOrder);
                // save bill to user database
                realtime().ref(`/users/${auth().currentUser.uid}/bills`).push({
                  amount: price,
                  chargeOrder: chargeOrder,
                  date: new Date().toLocaleString(),
                });
              });
            }
          });
        }}></Button>
    </View>
  );
}
