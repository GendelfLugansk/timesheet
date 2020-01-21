import React, { useEffect } from "react";
import { connect } from "react-redux";
import objectPath from "object-path";
import { DateTime } from "luxon";
import { sync } from "../../../actions/syncableStorage";
import Loader from "../../Loader/Loader";
import { useTranslation } from "react-i18next";
import "./SummaryReportPage.scss";
import stringifyError from "../../../utils/stringifyError";
import i18n from "../../../utils/i18n";
import en from "./SummaryReportPage.en";
import ru from "./SummaryReportPage.ru";
import LoaderOverlay from "../../Loader/LoaderOverlay/LoaderOverlay";
import { filterFunction } from "../../../utils/logFilters";
import ProjectsPie from "./ProjectsPie/ProjectsPie";
import TagsPie from "./TagsPie/TagsPie";

const ns = "SummaryReportPage";
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const SummaryReportPage = ({
  isSyncing,
  syncError,
  logItems,
  fetchState,
  syncAll,
  workspaceId
}) => {
  const { t } = useTranslation(ns);

  useEffect(fetchState, [workspaceId]);

  const syncRetry = () => {
    syncAll();
  };

  if (isSyncing && logItems.length === 0) {
    return (
      <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle">
        <div>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="uk-padding-small SummaryReportPage">
      <div
        className="uk-width-1-1 uk-child-width-1-1 uk-child-width-1-2@l uk-child-width-1-3@xl uk-position-relative uk-flex-center"
        uk-grid="true"
      >
        {isSyncing ? <LoaderOverlay /> : null}

        {syncError ? (
          <div className="uk-width-1-1">
            <div className="uk-alert-danger" uk-alert="true">
              {t("syncError", { error: stringifyError(syncError) })}{" "}
              <button
                onClick={syncRetry}
                type="button"
                className="uk-button uk-button-link"
              >
                {t("syncRetryButton")}
              </button>
            </div>
          </div>
        ) : null}

        <div>
          <ProjectsPie logItems={logItems} workspaceId={workspaceId} />
        </div>

        <div>
          <TagsPie logItems={logItems} workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
};

export { SummaryReportPage };

export default connect(
  (state, { workspaceId, filters = [] }) => ({
    isSyncing: objectPath.get(
      state.syncableStorage,
      `${workspaceId}.Log.isSyncing`,
      false
    ),
    syncError: objectPath.get(
      state.syncableStorage,
      `${workspaceId}.Log.error`,
      null
    ),
    logItems: objectPath
      .get(state.syncableStorage, `${workspaceId}.Log.data`, [])
      .filter(({ _deleted }) => !_deleted)
      .filter(filterFunction(filters))
      .sort(
        (a, b) =>
          DateTime.fromISO(b.startTimeString) -
          DateTime.fromISO(a.startTimeString)
      )
  }),
  (dispatch, { workspaceId }) => ({
    fetchState: () => {
      dispatch(sync(workspaceId, "Log"));
    },
    syncAll: () => {
      dispatch(sync(workspaceId, "Log"));
    }
  })
)(SummaryReportPage);
