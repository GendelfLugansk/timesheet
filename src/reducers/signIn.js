import {
  SIGN_IN_BEGIN,
  SIGN_IN_SUCCESS,
  SIGN_IN_FAILURE,
  SIGN_IN_CLEAR_ERROR
} from "../actions/signIn";

const initialState = {
  isLoading: false,
  error: null
};

const signIn = (state = initialState, action) => {
  switch (action.type) {
    case SIGN_IN_BEGIN:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case SIGN_IN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null
      };

    case SIGN_IN_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error
      };

    case SIGN_IN_CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default signIn;
