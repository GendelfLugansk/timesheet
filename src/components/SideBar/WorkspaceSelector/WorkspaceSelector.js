import React, { useEffect } from "react";
import i18n from "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./WorkspaceSelector.en";
import ru from "./WorkspaceSelector.ru";
import { connect } from "react-redux";
import { fetchWorkspaces } from "../../../actions/workspaces";
import { selectWorkspace } from "../../../actions/workspaces";
import objectPath from "object-path";

const ns = "WorkspaceSelector";
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const WorkspaceSelector = ({
  workspaces,
  currentWorkspace,
  fetchState,
  selectWorkspace
}) => {
  const { t } = useTranslation(ns);

  const maybeFetch = () => {
    if (workspaces.length === 0) {
      fetchState();
    }
  };
  useEffect(maybeFetch, []);

  if (workspaces.length === 0) {
    return null;
  }

  return (
    <div className="uk-width-1-1">
      <div className="uk-inline uk-width-1-1">
        <button
          type="button"
          className="uk-button uk-button-default uk-width-1-1 text-overflow-ellipsis"
        >
          {(() => {
            if (currentWorkspace) {
              return (
                currentWorkspace.nameShort +
                " / " +
                objectPath.get(currentWorkspace, "owners.0.displayName")
              );
            }

            return t("empty");
          })()}
        </button>
        <div
          uk-dropdown="mode: click"
          uk-overflow-auto="true"
          className="uk-height-max-small"
        >
          <ul className="uk-nav uk-dropdown-nav uk-width-1-1">
            <li className="uk-nav-header">{t("header")}</li>
            {workspaces.map(workspace => (
              <li
                key={workspace.id}
                className={
                  workspace.id === objectPath.get(currentWorkspace, "id")
                    ? "uk-active"
                    : null
                }
              >
                <button
                  className="button-link"
                  onClick={() => {
                    selectWorkspace(workspace);
                  }}
                >
                  <strong>{workspace.nameShort}</strong> <br />
                  {objectPath.get(workspace, "owners.0.displayName")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export { WorkspaceSelector };

export default connect(
  state => ({
    workspaces: state.workspaces.list,
    currentWorkspace: state.workspaces.currentWorkspace
  }),
  dispatch => ({
    fetchState: () => {
      dispatch(fetchWorkspaces());
    },
    selectWorkspace: workspace => {
      dispatch(selectWorkspace(workspace));
    }
  })
)(WorkspaceSelector);
