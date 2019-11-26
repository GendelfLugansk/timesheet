import React, { useEffect } from "react";
import { connect } from "react-redux";
import { fetchAuthStatus } from "../../../actions/auth";
import { signOut, signOutClearError } from "../../../actions/signOut";
import "./CurrentUser.scss";
import i18n from "../../../i18n";
import { useTranslation } from "react-i18next";
import en from "./CurrentUser.en";
import ru from "./CurrentUser.ru";

const ns = "CurrentUser";
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const CurrentUser = ({
  isAuthenticated,
  currentUser,
  signOutError,
  fetchState,
  signOutButtonClick,
  signOutClearError
}) => {
  useEffect(fetchState, []);
  const { t } = useTranslation(ns);

  if (isAuthenticated) {
    return (
      <div className="uk-padding-small uk-padding-remove-horizontal uk-padding-remove-top CurrentUser">
        <div className="uk-flex">
          <div className="uk-margin-small-right uk-flex-none">
            <img
              className="uk-border-circle user-image"
              data-src={currentUser.image}
              width="32"
              height="32"
              alt=""
              uk-img={currentUser.image}
            />
          </div>
          <div className="right-column">
            <div className="user-name">{currentUser.name}</div>
            <div>
              <button
                className="uk-button uk-button-link button-link"
                onClick={signOutButtonClick}
              >
                {t("signOutButton")}
              </button>
            </div>
          </div>
        </div>
        {signOutError ? (
          <div>
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
      </div>
    );
  }

  return null;
};

export { CurrentUser };

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
)(CurrentUser);
