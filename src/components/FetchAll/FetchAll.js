import React, { useEffect } from "react";
import { connect } from "react-redux";
import { fetchAuthStatus } from "../../actions/auth";
import { fetchWorkspaces } from "../../actions/workspaces";
import objectPath from "object-path";
import { sync } from "../../actions/syncableStorage";
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

const FetchAuth = connect(
  state => ({
    isLoading: state.auth.isLoading,
    error: state.auth.error,
    currentUserId: objectPath.get(state, "auth.currentUser.id")
  }),
  dispatch => ({
    fetchState: () => {
      dispatch(fetchAuthStatus());
    }
  })
)(({ currentUserId, isLoading, error, fetchState, children }) => {
  const { t } = useTranslation(ns);
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
      {React.Children.map(children, child => {
        return React.cloneElement(child, {
          currentUserId
        });
      })}
    </>
  );
});

const FetchWorkspaces = connect(
  state => ({
    isLoading: state.workspaces.isLoading,
    error: state.workspaces.error,
    workspaceId: objectPath.get(state, "workspaces.currentWorkspace.id")
  }),
  (dispatch, { currentUserId }) => ({
    fetchState: () => {
      if (typeof currentUserId === "string" && currentUserId.length > 0) {
        dispatch(fetchWorkspaces());
      }
    }
  })
)(({ currentUserId, workspaceId, isLoading, error, fetchState, children }) => {
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
      {React.Children.map(children, child => {
        return React.cloneElement(child, {
          workspaceId
        });
      })}
    </>
  );
});

const FetchData = connect(
  (state, { workspaceId }) => ({
    isLoading: isAnySyncing(state, workspaceId, [
      "Log",
      "Progress",
      "Projects",
      "Tags",
      "Config"
    ]),
    error: getFirstError(state, workspaceId, [
      "Log",
      "Progress",
      "Projects",
      "Tags",
      "Config"
    ])
  }),
  (dispatch, { workspaceId }) => ({
    fetchState: () => {
      if (typeof workspaceId === "string" && workspaceId.length > 0) {
        dispatch(
          sync(workspaceId, ["Log", "Progress", "Projects", "Tags", "Config"])
        );
      }
    }
  })
)(({ workspaceId, isLoading, error, fetchState, children }) => {
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
});

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
