import React from "react";
import { connect } from "react-redux";
import { signIn, signInClearError } from "../../actions/signIn";
import { signOut, signOutClearError } from "../../actions/signOut";
import { useHistory, useLocation } from "react-router-dom";
import "./LoginPage.scss";
import DocumentTitle from "../DocumentTitle/DocumentTitle";
import i18n from "../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./LoginPage.en";
import ru from "./LoginPage.ru";
import Loader from "../Loader/Loader";
import stringifyError from "../../utils/stringifyError";
import uuidv4 from "uuid/v4";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const LoginPage = ({
  isAuthenticated,
  isLoading,
  currentUser,
  signInError,
  signOutError,
  signInButtonClick,
  signInClearError,
  signOutButtonClick,
  signOutClearError
}) => {
  const { t } = useTranslation(ns);

  let history = useHistory();
  let location = useLocation();

  let { from } = location.state || { from: { pathname: "/" } };

  const signIn = async () => {
    await signInButtonClick();
    history.replace(from);
  };

  const Content = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (isAuthenticated) {
      return (
        <div className="uk-text-center">
          <div className="uk-padding-small">
            <img
              className="uk-border-circle user-image"
              data-src={currentUser.image}
              width="96"
              height="96"
              alt=""
              uk-img={currentUser.image}
            />
          </div>
          <div className="uk-padding-small uk-padding-remove-top">
            {t("authenticatedIntro", { name: currentUser.name })}
          </div>
          {signOutError ? (
            <div className="uk-padding-small uk-padding-remove-top">
              <div className="uk-alert-danger" uk-alert="true">
                <button
                  className="uk-alert-close"
                  uk-close="true"
                  onClick={signOutClearError}
                />
                {stringifyError(signOutError)}
              </div>
            </div>
          ) : null}
          <div className="uk-padding-small uk-padding-remove-top">
            <button
              className="uk-button uk-button-primary uk-button-large"
              onClick={signOutButtonClick}
            >
              {t("signOutButton")}
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="uk-text-center uk-padding-small">
          {t("unauthenticatedIntro")}
        </div>
        {signInError ? (
          <div className="uk-padding-small uk-padding-remove-top">
            <div className="uk-alert-danger" uk-alert="true">
              <button
                className="uk-alert-close"
                uk-close="true"
                onClick={signInClearError}
              />
              {stringifyError(signInError)}
            </div>
          </div>
        ) : null}
        <div className="uk-text-center uk-padding-small uk-padding-remove-top">
          <button
            className="uk-button uk-button-primary uk-button-large"
            onClick={signIn}
          >
            {t("signInButton")}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      <DocumentTitle title="Sign In" />
      <div className="uk-flex uk-flex-center uk-flex-middle min-height-100 LoginPage">
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
