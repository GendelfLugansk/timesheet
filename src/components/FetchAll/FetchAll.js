import React, { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { fetchAuthStatus } from "../../actions/auth";
import { fetchWorkspaces } from "../../actions/workspaces";
import objectPath from "object-path";
import { syncInWorkspace } from "../../actions/syncableStorage";
import { getFirstError, isAnySyncing } from "../../selectors/syncableStorage";
import stringifyError from "../../utils/stringifyError";
import i18n from "../../utils/i18n";
import en from "./FetchAll.en";
import ru from "./FetchAll.ru";
import uuidv4 from "uuid/v4";
import { useTranslation } from "react-i18next";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const authStateSelector = state => ({
  isLoading: state.auth.isLoading,
  error: state.auth.error
});

const FetchAuth = ({ children }) => {
  const { isLoading, error } = useSelector(authStateSelector, shallowEqual);
  const dispatch = useDispatch();
  const { t } = useTranslation(ns);
  const fetchState = () => {
    dispatch(fetchAuthStatus());
  };
  useEffect(fetchState, []);

  return (
    <>
      {error && !isLoading ? (
        <div
          className="uk-width-1-1 uk-alert-danger uk-margin-remove"
          uk-alert="true"
        >
          {t("syncError", { error: stringifyError(error) })}{" "}
          <button
            onClick={() => fetchState()}
            type="button"
            className="uk-button uk-button-link"
          >
            {t("syncRetryButton")}
          </button>
        </div>
      ) : null}
      {children}
    </>
  );
};

const workspacesSelector = state => ({
  currentUserId: objectPath.get(state, "auth.currentUser.id"),
  isLoading: state.workspaces.isLoading,
  error: state.workspaces.error
});

const FetchWorkspaces = ({ children }) => {
  const { currentUserId, isLoading, error } = useSelector(
    workspacesSelector,
    shallowEqual
  );
  const dispatch = useDispatch();
  const fetchState = () => {
    if (typeof currentUserId === "string" && currentUserId.length > 0) {
      dispatch(fetchWorkspaces());
    }
  };
  const { t } = useTranslation(ns);
  useEffect(fetchState, [currentUserId]);

  return (
    <>
      {error && !isLoading ? (
        <div
          className="uk-width-1-1 uk-alert-danger uk-margin-remove"
          uk-alert="true"
        >
          {t("syncError", { error: stringifyError(error) })}{" "}
          <button
            onClick={() => fetchState()}
            type="button"
            className="uk-button uk-button-link"
          >
            {t("syncRetryButton")}
          </button>
        </div>
      ) : null}
      {children}
    </>
  );
};

const fetchDataSelector = state => ({
  isLoading: isAnySyncing(state, [
    "Log",
    "Progress",
    "Projects",
    "Tags",
    "Config"
  ]),
  error: getFirstError(state, [
    "Log",
    "Progress",
    "Projects",
    "Tags",
    "Config"
  ]),
  workspaceId: objectPath.get(state, "workspaces.currentWorkspace.id")
});

const FetchData = ({ children }) => {
  const { workspaceId, isLoading, error } = useSelector(
    fetchDataSelector,
    shallowEqual
  );
  const dispatch = useDispatch();
  const fetchState = () => {
    if (typeof workspaceId === "string" && workspaceId.length > 0) {
      dispatch(
        syncInWorkspace(workspaceId, [
          "Log",
          "Progress",
          "Projects",
          "Tags",
          "Config"
        ])
      );
    }
  };
  const { t } = useTranslation(ns);
  useEffect(fetchState, [workspaceId]);

  return (
    <>
      {error && !isLoading ? (
        <div
          className="uk-width-1-1 uk-alert-danger uk-margin-remove"
          uk-alert="true"
        >
          {t("syncError", { error: stringifyError(error) })}{" "}
          <button
            onClick={() => fetchState()}
            type="button"
            className="uk-button uk-button-link"
          >
            {t("syncRetryButton")}
          </button>
        </div>
      ) : null}
      {children}
    </>
  );
};

const FetchAll = ({ children }) => {
  return (
    <FetchAuth>
      <FetchWorkspaces>
        <FetchData>{children}</FetchData>
      </FetchWorkspaces>
    </FetchAuth>
  );
};

export default FetchAll;
