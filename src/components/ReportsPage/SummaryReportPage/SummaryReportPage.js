import React, { memo } from "react";
import "./SummaryReportPage.scss";
import ProjectsPie from "./ProjectsPie/ProjectsPie";
import TagsPie from "./TagsPie/TagsPie";
import TimeBars from "./TimeBars/TimeBars";
import TotalHours from "./TotalHours/TotalHours";
import useFilteredLog from "../../../hooks/useFilteredLog";
import en from "./SummaryReportPage.en";
import ru from "./SummaryReportPage.ru";
import i18n from "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import uuidv4 from "uuid/v4";
import PrintableLogo from "../../PrintableLogo/PrintableLogo";
import DocumentTitle from "../../DocumentTitle/DocumentTitle";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const SummaryReportPage = memo(() => {
  const { t } = useTranslation(ns);
  const { logItems, isSyncing } = useFilteredLog();

  return (
    <>
      <DocumentTitle title={t("documentTitle")} />
      <div className="uk-padding-small SummaryReportPage uk-position-relative">
        <div className="uk-flex-center" uk-grid="true">
          <div className="uk-width-1-1 printer-only uk-text-center">
            <h3 className="uk-text-center uk-heading-small uk-margin-medium-bottom">
              <PrintableLogo />
              {t("printedTitle")}
            </h3>
          </div>
          <div className="uk-width-1-1">
            <TotalHours logItems={logItems} isSyncing={isSyncing} />
          </div>
          <div className="PieContainer uk-width-1-1 uk-width-1-2@l">
            <ProjectsPie logItems={logItems} isSyncing={isSyncing} />
          </div>
          <div className="PieContainer uk-width-1-1 uk-width-1-2@l">
            <TagsPie logItems={logItems} isSyncing={isSyncing} />
          </div>
          <div className="BarsContainer uk-width-1-1">
            <TimeBars logItems={logItems} isSyncing={isSyncing} />
          </div>
        </div>
      </div>
    </>
  );
});

export default SummaryReportPage;
