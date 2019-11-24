import loadGAPI from "../utils/googleapi";
import { fetchAuthSuccess, authStatusFromGAPI } from "./auth";
import stringifyError from "../utils/stringifyError";

const SIGN_OUT_BEGIN = "SIGN_OUT_BEGIN";
const SIGN_OUT_SUCCESS = "SIGN_OUT_SUCCESS";
const SIGN_OUT_FAILURE = "SIGN_OUT_FAILURE";
const SIGN_OUT_CLEAR_ERROR = "SIGN_OUT_CLEAR_ERROR";

const signOutBegin = () => ({ type: SIGN_OUT_BEGIN });

const signOutSuccess = () => ({ type: SIGN_OUT_SUCCESS });

const signOutFailure = error => ({
  type: SIGN_OUT_FAILURE,
  payload: { error }
});

const signOutClearError = () => ({ type: SIGN_OUT_CLEAR_ERROR });

const signOut = (allowConcurrency = false) => async (dispatch, getState) => {
  try {
    const {
      signOut: { isLoading }
    } = getState();

    if (isLoading && !allowConcurrency) {
      return;
    }

    dispatch(signOutBegin());
    const gapi = await loadGAPI();
    await gapi.auth2.getAuthInstance().signOut();
    dispatch(signOutSuccess());
    dispatch(fetchAuthSuccess(authStatusFromGAPI(gapi)));
  } catch (e) {
    dispatch(signOutFailure(stringifyError(e)));
  }
};

export {
  SIGN_OUT_BEGIN,
  SIGN_OUT_SUCCESS,
  SIGN_OUT_FAILURE,
  SIGN_OUT_CLEAR_ERROR,
  signOut,
  signOutClearError
};
