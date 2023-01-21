import {Platform} from 'react-native';

const productSkus = Platform.select({
  ios: ['charge1', 'charge2', 'charge3'],

  android: [
    'android.test.purchased',
    'android.test.canceled',
    'android.test.refunded',
    'android.test.item_unavailable',
  ],

  default: [],
}) as string[];

const subscriptionSkus = Platform.select({
  ios: ['ai.phantadream.app'],
  android: ['test.sub1'],
  default: [],
}) as string[];
const amazonBaseSku = 'com.amazon.sample.iap.subscription.mymagazine';

export const constants = {
  productSkus,
  subscriptionSkus,
  amazonBaseSku,
};
