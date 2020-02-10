import React, { memo } from "react";
import "./SummaryReportPage.scss";
import ProjectsPie from "./ProjectsPie/ProjectsPie";
import TagsPie from "./TagsPie/TagsPie";
import TimeBars from "./TimeBars/TimeBars";
import TotalHours from "./TotalHours/TotalHours";
import useFilteredLog from "../../../hooks/useFilteredLog";

const SummaryReportPage = memo(() => {
  const { logItems, isSyncing } = useFilteredLog();

  return (
    <div className="uk-padding-small SummaryReportPage uk-position-relative">
      <div className="uk-flex-center" uk-grid="true">
        <div className="uk-width-expand">
          <TimeBars logItems={logItems} isSyncing={isSyncing} />
        </div>

        <div>
          <div className="PiesContainer">
            <div>
              <TotalHours logItems={logItems} isSyncing={isSyncing} />
            </div>
            <div className="PieContainer">
              <ProjectsPie logItems={logItems} isSyncing={isSyncing} />
            </div>
            <div className="PieContainer">
              <TagsPie logItems={logItems} isSyncing={isSyncing} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SummaryReportPage;
