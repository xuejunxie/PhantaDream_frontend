import {UPDATE_USER} from '../types';

const initialState = {
  data: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_USER:
      return {
        ...state,
        data: action.payload,
      };

    default:
      return state;
  }
}
