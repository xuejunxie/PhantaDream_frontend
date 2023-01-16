import {SET_PROMPT} from '../types';

const initialState = {
  prompt: '',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_PROMPT:
      return {
        ...state,
        prompt: action.payload,
      };

    default:
      return state;
  }
}
