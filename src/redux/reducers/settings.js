import {ADD_WATERMARK} from '../types';

const initialState = {
  waterMakr: true,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case ADD_WATERMARK:
      return {
        ...state,
        waterMakr: action.payload,
      };

    default:
      return state;
  }
}
