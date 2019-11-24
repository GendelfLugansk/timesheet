import React, { useEffect } from "react";
import { connect } from "react-redux";
import { fetchAuthStatus } from "../../actions/auth";
import { signIn, signInClearError } from "../../actions/signIn";
import { signOut, signOutClearError } from "../../actions/signOut";
import { useHistory, useLocation } from "react-router-dom";
import "./LoginPage.scss";
import DocumentTitle from "../DocumentTitle/DocumentTitle";

const LoginPage = ({
  isAuthenticated,
  isLoading,
  currentUser,
  signInError,
  signOutError,
  fetchState,
  signInButtonClick,
  signInClearError,
  signOutButtonClick,
  signOutClearError
}) => {
  useEffect(fetchState, []);

  let history = useHistory();
  let location = useLocation();

  let { from } = location.state || { from: { pathname: "/" } };

  const signIn = async () => {
    await signInButtonClick();
    history.replace(from);
  };

  const Content = () => {
    if (isLoading) {
      return <div uk-spinner="ratio: 3" />;
    }

    if (isAuthenticated) {
      return (
        <div className="uk-text-center">
          <div className="uk-padding-small">
            <img className="uk-border-circle" alt="" src={currentUser.image} />
          </div>
          <div className="uk-padding-small uk-padding-remove-top">
            You signed in as {currentUser.name}
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

    return (
      <>
        <div className="uk-text-center uk-padding-small">
          Timesheets utilizes Google Spreadsheets and Google Drive API. In order
          to use Timesheets, you need to sign in using your Google account
        </div>
        {signInError ? (
          <div className="uk-padding-small uk-padding-remove-top">
            <div className="uk-alert-danger" uk-alert="true">
              <button
                className="uk-alert-close"
                uk-close="true"
                onClick={signInClearError}
              />
              {signInError}
            </div>
          </div>
        ) : null}
        <div className="uk-text-center uk-padding-small uk-padding-remove-top">
          <button className="uk-button uk-button-primary" onClick={signIn}>
            Sign in
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      <DocumentTitle title="Sign In" />
      <div className="uk-flex uk-flex-center uk-flex-middle LoginPage">
        <div>
          <Content />
        </div>
      </div>
    </>
  );
};

export { LoginPage };

export default connect(
  state => ({
    isAuthenticated: state.auth.isAuthenticated,
    isLoading:
      state.auth.isLoading || state.signIn.isLoading || state.signOut.isLoading,
    currentUser: state.auth.currentUser,
    signInError: state.signIn.error,
    signOutError: state.signOut.error
  }),
  dispatch => ({
    fetchState: () => {
      dispatch(fetchAuthStatus());
    },
    signInButtonClick: async () => {
      await dispatch(signIn());
    },
    signInClearError: () => {
      dispatch(signInClearError());
    },
    signOutButtonClick: () => {
      dispatch(signOut());
    },
    signOutClearError: () => {
      dispatch(signOutClearError());
    }
  })
)(LoginPage);
