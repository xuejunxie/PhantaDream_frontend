import {
  ADD_LIKED_IMAGES,
  LOAD_LIKED_IMAGES,
  REMOVE_LIKED_IMAGES,
  UPDATE_LIKED_IMAGES,
} from '../types';

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
          likedImage => likedImage.id !== action.payload.id,
        ),
      };
    case LOAD_LIKED_IMAGES:
      return {
        ...state,
        likedImages: action.payload,
      };
    case UPDATE_LIKED_IMAGES:
      // if the liked image exist update the liked image in the likedImages array
      // else add the liked image to the likedImages array
      if (
        state.likedImages.filter(
          likedImage => likedImage.id === action.payload.id,
        ).length === 0
      ) {
        console.log('add liked image');
        return {
          ...state,
          likedImages: [...state.likedImages, action.payload],
        };
      } else {
        console.log('update liked image');
        return {
          ...state,
          likedImages: state.likedImages.map(likedImage => {
            if (likedImage.id === action.payload.id) {
              return action.payload;
            } else {
              return likedImage;
            }
          }),
        };
      }

    default:
      return state;
  }
}
