import React, { memo, useCallback, useState } from "react";
import i18n from "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./WorkspaceSelector.en";
import ru from "./WorkspaceSelector.ru";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { selectWorkspace as selectWorkspaceAction } from "../../../actions/workspaces";
import objectPath from "object-path";
import uuidv4 from "uuid/v4";
import sheetsIcon from "./sheets_48dp.png";
import Modal from "../../UIKit/Modal/Modal";
import CreateWorkspace from "./CreateWorkspace/CreateWorkspace";
import { isAnySyncing } from "../../../selectors/syncableStorage";
import LoaderOverlay from "../../Loader/LoaderOverlay/LoaderOverlay";
import RemoveCurrentWorkspace from "./RemoveCurrentWorkspace/RemoveCurrentWorkspace";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const selector = state => ({
  workspaces: state.workspaces.list,
  currentWorkspace: state.workspaces.currentWorkspace,
  isSyncing:
    state.workspaces.isLoading ||
    isAnySyncing(state, ["Log", "Progress", "Projects", "Tags", "Config"])
});

const modalOptions = {
  stack: true
};

const WorkspaceSelector = memo(() => {
  const { workspaces, currentWorkspace, isSyncing } = useSelector(
    selector,
    shallowEqual
  );
  const dispatch = useDispatch();
  const selectWorkspace = useCallback(
    workspace => {
      dispatch(selectWorkspaceAction(workspace));
    },
    [dispatch]
  );
  const { t } = useTranslation(ns);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const startAdding = useCallback(() => {
    setIsAdding(true);
  }, []);

  const cancelAdding = useCallback(() => {
    setIsAdding(false);
  }, []);

  const startRemoving = useCallback(() => {
    setIsRemoving(true);
  }, []);

  const cancelRemoving = useCallback(() => {
    setIsRemoving(false);
  }, []);

  return (
    <div className="uk-position-relative">
      {isSyncing ? <LoaderOverlay ratio={1.5} /> : null}
      <div className="uk-width-1-1">
        <div className="uk-inline uk-width-1-1">
          <button
            type="button"
            className="uk-button uk-button-default uk-width-1-1 uk-text-truncate"
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
            className="uk-height-max-medium"
          >
            <ul className="uk-nav uk-dropdown-nav uk-width-1-1">
              <li className="uk-nav-header">{t("header")}</li>
              {workspaces.length === 0 ? (
                <li className="uk-disabled">{t("noWorkspaces")}</li>
              ) : null}
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

        <div className="uk-width-1-1 uk-padding-small uk-padding-remove-horizontal uk-padding-remove-bottom">
          <span
            className="uk-margin-small-right uk-icon-link"
            title={t("actionsPanel.addWorkspace")}
            uk-icon="icon: plus;"
            onClick={startAdding}
          />
          {currentWorkspace ? (
            <>
              <span
                className="uk-margin-small-right uk-icon-link"
                title={t("actionsPanel.removeCurrentWorkspace")}
                uk-icon="icon: trash;"
                onClick={startRemoving}
              />
              <a
                href={`https://docs.google.com/spreadsheets/d/${currentWorkspace.id}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                title={t("actionsPanel.openSpreadsheet")}
                className="uk-margin-small-right"
              >
                <img
                  src={sheetsIcon}
                  style={{ height: "20px" }}
                  alt={t("actionsPanel.openSpreadsheet")}
                />
              </a>
            </>
          ) : null}
        </div>
      </div>
      <div>
        <Modal show={isAdding} options={modalOptions}>
          <CreateWorkspace
            initialSortOrder={
              Math.max(0, ...workspaces.map(({ sortOrder }) => sortOrder)) + 1
            }
            onCancel={cancelAdding}
            onCreate={cancelAdding}
          />
        </Modal>
      </div>
      <div>
        <Modal show={isRemoving} options={modalOptions}>
          <RemoveCurrentWorkspace
            onCancel={cancelRemoving}
            onRemove={cancelRemoving}
          />
        </Modal>
      </div>
    </div>
  );
});

export { WorkspaceSelector };

export default WorkspaceSelector;
