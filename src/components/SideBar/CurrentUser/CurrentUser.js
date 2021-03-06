import React, { memo, useCallback } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import {
  signOut,
  signOutClearError as signOutClearErrorAction
} from "../../../actions/signOut";
import "./CurrentUser.scss";
import i18n from "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./CurrentUser.en";
import ru from "./CurrentUser.ru";
import stringifyError from "../../../utils/stringifyError";
import uuidv4 from "uuid/v4";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const selector = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  currentUser: state.auth.currentUser,
  signOutError: state.signOut.error
});

const CurrentUser = memo(() => {
  const { isAuthenticated, currentUser, signOutError } = useSelector(
    selector,
    shallowEqual
  );
  const dispatch = useDispatch();
  const signOutButtonClick = useCallback(() => {
    dispatch(signOut());
  }, [dispatch]);
  const signOutClearError = useCallback(() => {
    dispatch(signOutClearErrorAction());
  }, [dispatch]);
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
              <button className="button-link" onClick={signOutButtonClick}>
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
              {stringifyError(signOutError)}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return null;
});

export { CurrentUser };

export default CurrentUser;
