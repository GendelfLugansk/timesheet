import React from "react";
import { connect } from "react-redux";
import Loader from "../../Loader/Loader";
import "./SummaryReportPage.scss";
import LoaderOverlay from "../../Loader/LoaderOverlay/LoaderOverlay";
import { filterFunction } from "../../../utils/logFilters";
import ProjectsPie from "./ProjectsPie/ProjectsPie";
import TagsPie from "./TagsPie/TagsPie";
import TimeBars from "./TimeBars/TimeBars";
import TotalHours from "./TotalHours/TotalHours";
import { findMany, isSyncing } from "../../../selectors/syncableStorage";
import i18n from "../../../utils/i18n";
import en from "./SummaryReportPage.en";
import ru from "./SummaryReportPage.ru";
import uuidv4 from "uuid/v4";
import { useTranslation } from "react-i18next";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const SummaryReportPage = ({ isSyncing, logItems }) => {
  const { t } = useTranslation(ns);

  if (isSyncing && logItems.length === 0) {
    return (
      <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle">
        <div>
          <Loader />
        </div>
      </div>
    );
  }

  if (logItems.length === 0) {
    return (
      <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle min-height-100">
        <div className="uk-width-1-1 uk-width-1-2@l uk-text-center">
          {t("noData")}
        </div>
      </div>
    );
  }

  return (
    <div className="uk-padding-small SummaryReportPage uk-position-relative">
      {isSyncing ? <LoaderOverlay /> : null}
      <div className="uk-flex-center" uk-grid="true">
        <div className="uk-width-expand">
          <TimeBars logItems={logItems} />
        </div>

        <div>
          <div className="PiesContainer">
            <div>
              <TotalHours logItems={logItems} />
            </div>
            <div>
              <ProjectsPie logItems={logItems} />
            </div>
            <div>
              <TagsPie logItems={logItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SummaryReportPage };

export default connect((state, { filters = [] }) => ({
  isSyncing: isSyncing(state, "Log"),
  logItems: findMany(state, "Log").filter(filterFunction(filters))
}))(SummaryReportPage);
