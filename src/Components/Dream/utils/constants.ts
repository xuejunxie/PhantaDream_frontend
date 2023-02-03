import {Platform} from 'react-native';
import {productID} from '../../common/globalValues';

const productSkus = Platform.select({
  ios: [productID.charge1, productID.charge2, productID.charge3],

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
