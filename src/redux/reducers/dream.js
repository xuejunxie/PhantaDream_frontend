import {
  SET_PROMPT,
  SET_PRODUCT_ID,
  FILL_CHARGE,
  SET_CHARGE_ORDER,
  BUY_CHARGE_LOADING,
} from '../types';

const initialState = {
  prompt: '',
  productID: '',
  chargeOrder: 0,
  fillCharge: 0,
  buyChargeLoading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_PROMPT:
      return {
        ...state,
        prompt: action.payload,
      };
    case SET_PRODUCT_ID:
      return {
        ...state,
        productID: action.payload,
      };
    case SET_CHARGE_ORDER:
      return {
        ...state,
        chargeOrder: action.payload,
      };
    case FILL_CHARGE:
      return {
        ...state,
        fillCharge: state.chargeOrder,
      };
    case BUY_CHARGE_LOADING:
      return {
        ...state,
        buyChargeLoading: action.payload,
      };

    default:
      return state;
  }
}
