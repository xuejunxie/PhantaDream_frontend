import React, {useEffect} from 'react';
import ApplePay, {DetailsData, MethodData} from 'react-native-apple-payment';
import {TouchableOpacity, View, Button} from 'react-native';

export default function Payment({price}) {
  const Method: MethodData = {
    countryCode: 'US',
    currencyCode: 'USD',
    merchantIdentifier: 'merchant.phantadream',
    supportedNetworks: ['Visa', 'MasterCard', 'AmEx'],
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
            console.log(can);
            console.log(price);
            // if (can) {
            payment.initApplePay().then(console.warn);
            // }
          });
        }}></Button>
    </View>
  );
}
