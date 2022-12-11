import React from 'react';
import ApplePay, {DetailsData, MethodData} from 'react-native-apple-payment';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from 'react-native';

export default function Charge() {
  const Method: MethodData = {
    countryCode: 'US',
    currencyCode: 'USD',
    merchantIdentifier: 'merchant.phantadream',
    supportedNetworks: ['Visa', 'MasterCard', 'AmEx'],
  };

  const Options: DetailsData = {
    total: {
      label: 'PhantaCharge',
      amount: 10,
    },
  };

  const payment = new ApplePay(Method, Options);

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          payment.canMakePayments().then((can: any) => {
            console.log(can);
            if (can) {
              payment.initApplePay().then(console.warn);
            }
          });
        }}>
        <Text>Charge</Text>
      </TouchableOpacity>
    </View>
  );
}
