import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { DateTime, Duration } from "luxon";
import Loader from "../../Loader/Loader";
import { useTranslation } from "react-i18next";
import "./CalendarReportPage.scss";
import stringifyError from "../../../utils/stringifyError";
import LoaderOverlay from "../../Loader/LoaderOverlay/LoaderOverlay";
import { filterFunction } from "../../../utils/logFilters";
//eslint-disable-next-line import/no-webpack-loader-syntax
import worker from "workerize-loader!./worker";
import useTask, { CONCURRENCY_STRATEGY_RESTART } from "../../../hooks/useTask";
import { findMany, isSyncing } from "../../../selectors/syncableStorage";
import i18n from "../../../utils/i18n";
import en from "./CalendarReportPage.en";
import ru from "./CalendarReportPage.ru";
import uuidv4 from "uuid/v4";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const CalendarReportPage = ({ isSyncing, logItems }) => {
  const { i18n } = useTranslation();
  const { t } = useTranslation(ns);
  const [year, setYear] = useState();

  const fullDayHours = 8;

  const years = [
    ...new Set(
      logItems.map(
        ({ startTimeString }) =>
          DateTime.fromJSDate(new Date(startTimeString)).toLocal().year
      )
    )
  ].sort((a, b) => b - a);
  let yearToDisplay = year;
  if (
    !years.includes(yearToDisplay) &&
    years.length > 0 &&
    typeof years[0] === "number"
  ) {
    yearToDisplay = years[0];
    setYear(yearToDisplay);
  }

  const generateCalendar = useTask(
    async (logItems, fullDayHours, yearToDisplay, language, workerInstance) => {
      const start = new Date();
      const calendar = await workerInstance.generateCalendarData(
        logItems.filter(
          ({ startTimeString }) =>
            DateTime.fromJSDate(new Date(startTimeString)).toLocal().year ===
            yearToDisplay
        ),
        fullDayHours,
        language
      );
      workerInstance.terminate();
      console.log(new Date().valueOf() - start.valueOf());
      return calendar.sort((a, b) => b.startOfMonth - a.startOfMonth);
    },
    false,
    CONCURRENCY_STRATEGY_RESTART,
    (
      logItems,
      fullDayHours,
      yearToDisplay,
      language,
      workerInstance,
      taskInstance
    ) => {
      workerInstance.terminate();
    }
  );

  useEffect(() => {
    generateCalendar.perform(
      logItems,
      fullDayHours,
      yearToDisplay,
      i18n.language,
      worker()
    );
  }, [logItems, fullDayHours, yearToDisplay, i18n.language, generateCalendar]);

  if (
    (isSyncing && logItems.length === 0) ||
    (generateCalendar.isRunning &&
      (!Array.isArray(generateCalendar.result) ||
        generateCalendar.result.length === 0))
  ) {
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
    <div className="uk-padding-small CalendarReportPage">
      {years.length > 1 ? (
        <ul className="uk-pagination uk-flex-center uk-margin-medium-bottom unprintable">
          {years.map(year => (
            <li
              className={year === yearToDisplay ? "uk-active" : null}
              key={year}
            >
              <button
                type="button"
                className="button-link"
                onClick={() => {
                  setYear(year);
                }}
              >
                {year}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div
        className="uk-child-width-1-1 uk-child-width-1-2@xl calendar"
        uk-grid="true"
      >
        {generateCalendar.getLatestInstanceErrorIfNotCanceled() ? (
          <div className="uk-width-1-1">
            <div className="uk-alert-danger" uk-alert="true">
              {stringifyError(
                generateCalendar.getLatestInstanceErrorIfNotCanceled()
              )}
            </div>
          </div>
        ) : null}

        {Array.isArray(generateCalendar.result)
          ? generateCalendar.result.map(({ key, name, weeks }) => (
              <div key={key} className="month">
                <div
                  className="uk-child-width-1-1 uk-grid-collapse uk-position-relative"
                  uk-grid="true"
                >
                  {isSyncing || generateCalendar.isRunning ? (
                    <LoaderOverlay />
                  ) : null}
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
                                      Math.min(
                                        100,
                                        dailyPercentage.toFixed(2)
                                      ) + "%"
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
            ))
          : null}
      </div>

      {years.length > 1 ? (
        <ul className="uk-pagination uk-flex-center uk-margin-medium-top unprintable">
          {years.map(year => (
            <li
              className={year === yearToDisplay ? "uk-active" : null}
              key={year}
            >
              <button
                type="button"
                className="button-link"
                onClick={() => {
                  setYear(year);
                }}
              >
                {year}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export { CalendarReportPage };

export default connect((state, { filters = [] }) => ({
  isSyncing: isSyncing(state, "Log"),
  logItems: findMany(state, "Log").filter(filterFunction(filters))
}))(CalendarReportPage);
