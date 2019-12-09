import loadGAPI from "../utils/googleapi";

const authStatusFromGAPI = gapi => {
  const isAuthenticated = gapi.auth2.getAuthInstance().isSignedIn.get();
  const currentUser = isAuthenticated
    ? {
        id: gapi.auth2
          .getAuthInstance()
          .currentUser.get()
          .getBasicProfile()
          .getId(),
        email: gapi.auth2
          .getAuthInstance()
          .currentUser.get()
          .getBasicProfile()
          .getEmail(),
        name: gapi.auth2
          .getAuthInstance()
          .currentUser.get()
          .getBasicProfile()
          .getName(),
        image: gapi.auth2
          .getAuthInstance()
          .currentUser.get()
          .getBasicProfile()
          .getImageUrl()
      }
    : {};

  return { isAuthenticated, currentUser };
};

const FETCH_AUTH_BEGIN = "FETCH_AUTH_BEGIN";
const FETCH_AUTH_SUCCESS = "FETCH_AUTH_SUCCESS";
const FETCH_AUTH_FAILURE = "FETCH_AUTH_FAILURE";
const AUTH_SUBSCRIPTION_BEGIN = "AUTH_SUBSCRIPTION_BEGIN";
const AUTH_SUBSCRIPTION_SUCCESS = "AUTH_SUBSCRIPTION_SUCCESS";
const AUTH_SUBSCRIPTION_FAILURE = "AUTH_SUBSCRIPTION_FAILURE";

const fetchAuthBegin = () => ({
  type: FETCH_AUTH_BEGIN
});

const fetchAuthSuccess = ({ isAuthenticated, currentUser }) => ({
  type: FETCH_AUTH_SUCCESS,
  payload: { isAuthenticated, currentUser }
});

const fetchAuthFailure = error => ({
  type: FETCH_AUTH_FAILURE,
  payload: { error }
});

const authSubscriptionBegin = () => ({ type: AUTH_SUBSCRIPTION_BEGIN });

const authSubscriptionSuccess = () => ({ type: AUTH_SUBSCRIPTION_SUCCESS });

const authSubscriptionFailure = error => ({
  type: AUTH_SUBSCRIPTION_FAILURE,
  payload: { error }
});

const subscribeToAuthChanges = (allowConcurrency = false) => async (
  dispatch,
  getState
) => {
  try {
    const {
      auth: { isSubscriptionLoading, isSubscribed }
    } = getState();

    if (isSubscribed) {
      return;
    }

    if (isSubscriptionLoading && !allowConcurrency) {
      return;
    }

    dispatch(authSubscriptionBegin());
    const gapi = await loadGAPI();
    gapi.auth2.getAuthInstance().isSignedIn.listen(isSignedIn => {
      dispatch(fetchAuthSuccess(authStatusFromGAPI(gapi)));
    });
    dispatch(authSubscriptionSuccess());
  } catch (e) {
    dispatch(authSubscriptionFailure(e));
  }
};

const fetchAuthStatus = (allowConcurrency = false) => async (
  dispatch,
  getState
) => {
  try {
    const {
      auth: { isLoading }
    } = getState();

    if (isLoading && !allowConcurrency) {
      return;
    }

    dispatch(fetchAuthBegin());
    const gapi = await loadGAPI();
    dispatch(fetchAuthSuccess(authStatusFromGAPI(gapi)));
    await dispatch(subscribeToAuthChanges());
  } catch (e) {
    dispatch(fetchAuthFailure(e));
  }
};

export {
  FETCH_AUTH_BEGIN,
  FETCH_AUTH_SUCCESS,
  FETCH_AUTH_FAILURE,
  AUTH_SUBSCRIPTION_BEGIN,
  AUTH_SUBSCRIPTION_SUCCESS,
  AUTH_SUBSCRIPTION_FAILURE,
  authStatusFromGAPI,
  fetchAuthSuccess,
  fetchAuthStatus
};
