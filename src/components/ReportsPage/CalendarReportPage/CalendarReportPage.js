import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import objectPath from "object-path";
import { DateTime, Duration } from "luxon";
import { sync } from "../../../actions/syncableStorage";
import Loader from "../../Loader/Loader";
import { useTranslation } from "react-i18next";
import "./CalendarReportPage.scss";
import stringifyError from "../../../utils/stringifyError";
import i18n from "../../../utils/i18n";
import en from "./CalendarReportPage.en";
import ru from "./CalendarReportPage.ru";
import LoaderOverlay from "../../Loader/LoaderOverlay/LoaderOverlay";
import { filterFunction } from "../../../utils/logFilters";
import uuidv4 from "uuid/v4";
//eslint-disable-next-line import/no-webpack-loader-syntax
import worker from "workerize-loader!./worker";
import useTask from "../../../hooks/useTask";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const CalendarReportPage = ({
  isSyncing,
  syncError,
  logItems,
  fetchState,
  syncAll,
  workspaceId
}) => {
  const { t } = useTranslation(ns);
  const { i18n } = useTranslation();
  const [calendar, setCalendar] = useState({});
  const [processingError, setProcessingError] = useState();
  useEffect(fetchState, [workspaceId]);

  const fullDayHours = 8;

  const generateCalendar = useTask(async (logItems, fullDayHours, language) => {
    try {
      const start = new Date();
      const workerInstance = worker();
      const calendar = await workerInstance.generateCalendarData(
        logItems,
        fullDayHours,
        language
      );
      workerInstance.terminate();
      console.log(new Date().valueOf() - start.valueOf());
      setCalendar(calendar);
      setProcessingError(undefined);
    } catch (e) {
      setProcessingError(e);
    }
  });

  useEffect(() => {
    generateCalendar.perform(logItems, fullDayHours, i18n.language);
  }, [logItems, fullDayHours, i18n.language, generateCalendar]);

  const syncRetry = () => {
    syncAll();
  };

  if (
    (isSyncing && logItems.length === 0) ||
    (generateCalendar.isRunning && Object.values(calendar).length === 0)
  ) {
    return (
      <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle">
        <div>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="uk-padding-small CalendarReportPage">
      <div
        className="uk-child-width-1-1 uk-child-width-1-2@xl calendar"
        uk-grid="true"
      >
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

        {processingError ? (
          <div className="uk-width-1-1">
            <div className="uk-alert-danger" uk-alert="true">
              {stringifyError(processingError)}
            </div>
          </div>
        ) : null}

        {Object.entries(calendar)
          .sort(([, a], [, b]) => b.startOfMonth - a.startOfMonth)
          .map(([key, { name, weeks }]) => (
            <div key={key} className="month">
              <div
                className="uk-child-width-1-1 uk-grid-collapse uk-position-relative"
                uk-grid="true"
              >
                {isSyncing ? <LoaderOverlay /> : null}
                <div className="uk-text-lead uk-text-center uk-text-capitalize">
                  {name}
                </div>
                {weeks.map((week, index) => (
                  <div key={key + "_w_" + index} className="day-row">
                    <div className="uk-grid-collapse" uk-grid="true">
                      {week.map(
                        (
                          { dailyPercentage, durationHours, sum, day } = {},
                          dayIndex
                        ) => (
                          <div
                            key={key + "_w_" + index + "_d_" + dayIndex}
                            className={
                              "uk-width-1-7 day-cell " +
                              (typeof day === "number"
                                ? ""
                                : "uk-background-muted")
                            }
                          >
                            {typeof dailyPercentage === "number" ? (
                              <div
                                className="filler"
                                style={{
                                  width:
                                    Math.min(100, dailyPercentage.toFixed(2)) +
                                    "%"
                                }}
                              >
                                &nbsp;
                              </div>
                            ) : null}
                            <div className="uk-text-small">{day}</div>
                            {typeof durationHours == "number" &&
                            durationHours > 0 ? (
                              <div className="uk-text-bold uk-text-small">
                                {Duration.fromObject({
                                  hours: durationHours
                                }).toFormat("h:mm:ss")}
                              </div>
                            ) : null}
                            {typeof sum == "number" && sum > 0 ? (
                              <div className="uk-text-small">
                                {"$" + sum.toFixed(2)}
                              </div>
                            ) : null}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export { CalendarReportPage };

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
  }),
  (dispatch, { workspaceId }) => ({
    fetchState: () => {
      dispatch(sync(workspaceId, "Log"));
    },
    syncAll: () => {
      dispatch(sync(workspaceId, "Log"));
    }
  })
)(CalendarReportPage);
