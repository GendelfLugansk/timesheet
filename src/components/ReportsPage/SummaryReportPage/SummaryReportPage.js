import React, { useEffect } from "react";
import { connect } from "react-redux";
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
import TimeBars from "./TimeBars/TimeBars";
import TotalHours from "./TotalHours/TotalHours";
import uuidv4 from "uuid/v4";
import {
  findMany,
  getError,
  isSyncing
} from "../../../selectors/syncableStorage";

const ns = uuidv4();
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
    <div className="uk-padding-small SummaryReportPage uk-position-relative">
      {isSyncing ? <LoaderOverlay /> : null}
      <div className="uk-flex-center" uk-grid="true">
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

        <div className="uk-width-expand">
          <TimeBars logItems={logItems} workspaceId={workspaceId} />
        </div>

        <div>
          <div className="PiesContainer">
            <div>
              <TotalHours logItems={logItems} />
            </div>
            <div>
              <ProjectsPie logItems={logItems} workspaceId={workspaceId} />
            </div>
            <div>
              <TagsPie logItems={logItems} workspaceId={workspaceId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SummaryReportPage };

export default connect(
  (state, { workspaceId, filters = [] }) => ({
    isSyncing: isSyncing(state, workspaceId, "Log"),
    syncError: getError(state, workspaceId, "Log"),
    logItems: findMany(state, workspaceId, "Log").filter(
      filterFunction(filters)
    )
  }),
  (dispatch, { workspaceId }) => ({
    fetchState: () => {
      dispatch(sync(workspaceId, ["Log"]));
    },
    syncAll: () => {
      dispatch(sync(workspaceId, ["Log"]));
    }
  })
)(SummaryReportPage);
