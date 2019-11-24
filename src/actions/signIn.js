import loadGAPI from "../utils/googleapi";
import { fetchAuthSuccess, authStatusFromGAPI } from "./auth";
import stringifyError from "../utils/stringifyError";

const SIGN_IN_BEGIN = "SIGN_IN_BEGIN";
const SIGN_IN_SUCCESS = "SIGN_IN_SUCCESS";
const SIGN_IN_FAILURE = "SIGN_IN_FAILURE";
const SIGN_IN_CLEAR_ERROR = "SIGN_IN_CLEAR_ERROR";

const signInBegin = () => ({ type: SIGN_IN_BEGIN });

const signInSuccess = () => ({ type: SIGN_IN_SUCCESS });

const signInFailure = error => ({ type: SIGN_IN_FAILURE, payload: { error } });

const signInClearError = () => ({ type: SIGN_IN_CLEAR_ERROR });

const signIn = (allowConcurrency = false) => async (dispatch, getState) => {
  try {
    const {
      signIn: { isLoading }
    } = getState();

    if (isLoading && !allowConcurrency) {
      return;
    }

    dispatch(signInBegin());
    const gapi = await loadGAPI();
    await gapi.auth2.getAuthInstance().signIn();
    dispatch(signInSuccess());
    dispatch(fetchAuthSuccess(authStatusFromGAPI(gapi)));
  } catch (e) {
    dispatch(signInFailure(stringifyError(e)));
  }
};

export {
  SIGN_IN_BEGIN,
  SIGN_IN_SUCCESS,
  SIGN_IN_FAILURE,
  SIGN_IN_CLEAR_ERROR,
  signIn,
  signInClearError
};
