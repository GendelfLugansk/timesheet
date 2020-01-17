import React, { useEffect } from "react";
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

const ns = "CalendarReportPage";
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

  useEffect(fetchState, [workspaceId]);

  const fullDayHours = 8;

  const calendar = logItems.reduce((acc, item) => {
    const startTime = DateTime.fromISO(item.startTimeString).toLocal();
    const month = startTime.toFormat("y-M");
    const startOfMonth = startTime.startOf("month");
    if (acc[month] === undefined) {
      //Map ignores empty values if array created as Array(7)
      const typicalWeek = [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      ];
      acc[month] = {
        name: startTime.setLocale(i18n.language).toFormat("LLLL, y"),
        startOfMonth,
        weeks: [
          [...typicalWeek],
          [...typicalWeek],
          [...typicalWeek],
          [...typicalWeek],
          [...typicalWeek],
          [...typicalWeek]
        ]
      };
      //Fill month with weeks
      for (
        let date = startOfMonth;
        date <= startTime.endOf("month").startOf("day");
        date = date.plus({ days: 1 })
      ) {
        const weekIndex =
          Math.ceil((date.day + startOfMonth.weekday - 1) / 7) - 1;
        const weekdayIndex = date.weekday - 1;
        if (acc[month].weeks[weekIndex][weekdayIndex] === undefined) {
          acc[month].weeks[weekIndex][weekdayIndex] = {
            items: [],
            durationHours: 0,
            sum: 0,
            dailyPercentage: 0,
            day: date.day
          };
        }
      }
    }
    const weekIndex =
      Math.ceil((startTime.day + startOfMonth.weekday - 1) / 7) - 1;
    const weekdayIndex = startTime.weekday - 1;
    acc[month].weeks[weekIndex][weekdayIndex].items.push(item);
    acc[month].weeks[weekIndex][weekdayIndex].durationHours +=
      typeof item.durationHours === "number" ? item.durationHours : 0;
    acc[month].weeks[weekIndex][weekdayIndex].sum +=
      typeof item.sum === "number" ? item.sum : 0;
    acc[month].weeks[weekIndex][weekdayIndex].dailyPercentage =
      (acc[month].weeks[weekIndex][weekdayIndex].durationHours * 100) /
      fullDayHours;

    return acc;
  }, {});

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
    <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle CalendarReportPage">
      <div
        className="uk-width-1-1 uk-child-width-1-1 uk-child-width-1-2@xl calendar"
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
)(CalendarReportPage);
