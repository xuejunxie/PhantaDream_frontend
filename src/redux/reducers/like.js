import {ADD_LIKED_IMAGES, REMOVE_LIKED_IMAGES} from '../types';

const initialState = {
  likedImages: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case ADD_LIKED_IMAGES:
      return {
        ...state,
        likedImages: [...state.likedImages, action.payload],
      };
    case REMOVE_LIKED_IMAGES:
      return {
        ...state,
        likedImages: state.likedImages.filter(
          likedImage => likedImage.id !== action.payload,
        ),
      };

    default:
      return state;
  }
}
