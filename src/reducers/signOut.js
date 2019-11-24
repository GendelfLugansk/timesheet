import {
  SIGN_OUT_BEGIN,
  SIGN_OUT_SUCCESS,
  SIGN_OUT_FAILURE,
  SIGN_OUT_CLEAR_ERROR
} from "../actions/signOut";

const initialState = {
  isLoading: false,
  error: null
};

const signOut = (state = initialState, action) => {
  switch (action.type) {
    case SIGN_OUT_BEGIN:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case SIGN_OUT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null
      };

    case SIGN_OUT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error
      };

    case SIGN_OUT_CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default signOut;
