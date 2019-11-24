import {
  FETCH_AUTH_BEGIN,
  FETCH_AUTH_FAILURE,
  FETCH_AUTH_SUCCESS,
  AUTH_SUBSCRIPTION_BEGIN,
  AUTH_SUBSCRIPTION_SUCCESS,
  AUTH_SUBSCRIPTION_FAILURE
} from "../actions/auth";

const initialState = {
  isLoading: false,
  error: null,
  isAuthenticated: undefined,
  currentUser: {},
  isSubscriptionLoading: false,
  isSubscribed: false,
  subscriptionError: null
};

const auth = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_AUTH_BEGIN:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case FETCH_AUTH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        isAuthenticated: action.payload.isAuthenticated,
        currentUser: action.payload.currentUser
      };

    case FETCH_AUTH_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error
      };

    case AUTH_SUBSCRIPTION_BEGIN:
      return {
        ...state,
        isSubscriptionLoading: true,
        subscriptionError: null
      };

    case AUTH_SUBSCRIPTION_SUCCESS:
      return {
        ...state,
        isSubscriptionLoading: false,
        subscriptionError: null,
        isSubscribed: true
      };

    case AUTH_SUBSCRIPTION_FAILURE:
      return {
        ...state,
        isSubscriptionLoading: false,
        subscriptionError: action.payload.error
      };

    default:
      return state;
  }
};

export default auth;
