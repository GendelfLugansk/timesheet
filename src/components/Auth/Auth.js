import React, { useEffect } from "react";
import { connect } from "react-redux";
import { fetchAuthStatus } from "../../actions/auth";
import { signOut, signOutClearError } from "../../actions/signOut";

const Auth = ({
  isAuthenticated,
  currentUser,
  signOutError,
  fetchState,
  signOutButtonClick,
  signOutClearError
}) => {
  useEffect(fetchState, []);

  let content = null;
  if (isAuthenticated) {
    content = (
      <div className="uk-text-center">
        <div className="uk-padding-small">
          <img className="uk-border-circle" alt="" src={currentUser.image} />
        </div>
        <div className="uk-padding-small uk-padding-remove-top">
          {currentUser.name}
        </div>
        {signOutError ? (
          <div className="uk-padding-small uk-padding-remove-top">
            <div className="uk-alert-danger" uk-alert="true">
              <button
                className="uk-alert-close"
                uk-close="true"
                onClick={signOutClearError}
              />
              {signOutError}
            </div>
          </div>
        ) : null}
        <div className="uk-padding-small uk-padding-remove-top">
          <button
            className="uk-button uk-button-primary"
            onClick={signOutButtonClick}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return content;
};

export { Auth };

export default connect(
  state => ({
    isAuthenticated: state.auth.isAuthenticated,
    currentUser: state.auth.currentUser,
    signOutError: state.signOut.error
  }),
  dispatch => ({
    fetchState: () => {
      dispatch(fetchAuthStatus());
    },
    signOutButtonClick: () => {
      dispatch(signOut());
    },
    signOutClearError: () => {
      dispatch(signOutClearError());
    }
  })
)(Auth);
