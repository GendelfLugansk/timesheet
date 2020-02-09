import React, { memo } from "react";
import "./SummaryReportPage.scss";
import ProjectsPie from "./ProjectsPie/ProjectsPie";
import TagsPie from "./TagsPie/TagsPie";
import TimeBars from "./TimeBars/TimeBars";
import TotalHours from "./TotalHours/TotalHours";
import i18n from "../../../utils/i18n";
import en from "./SummaryReportPage.en";
import ru from "./SummaryReportPage.ru";
import uuidv4 from "uuid/v4";
import { useTranslation } from "react-i18next";
import useFilteredLog from "../../../hooks/useFilteredLog";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const SummaryReportPage = memo(() => {
  const logItems = useFilteredLog();
  const { t } = useTranslation(ns);

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
      <div className="uk-flex-center" uk-grid="true">
        <div className="uk-width-expand">
          <TimeBars />
        </div>

        <div>
          <div className="PiesContainer">
            <div>
              <TotalHours />
            </div>
            <div>
              <ProjectsPie />
            </div>
            <div>
              <TagsPie />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SummaryReportPage;
