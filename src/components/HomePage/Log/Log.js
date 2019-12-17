import React, { useEffect } from "react";
import { connect } from "react-redux";
import objectPath from "object-path";
import { sync } from "../../../actions/syncableStorage";
import { DateTime } from "luxon";
import "./Log.scss";
import noImage from "./no-image.png";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";
import en from "./Log.en";
import ru from "./Log.ru";
import Tags from "./Tags/Tags";
import Loader from "../../Loader/Loader";
import stringifyError from "../../../utils/stringifyError";

const ns = "Log";
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const Log = ({
  workspaceId,
  isSyncing,
  syncError,
  logItems,
  fetchState,
  syncLog
}) => {
  const { t } = useTranslation(ns);

  useEffect(fetchState, []);

  const syncRetry = () => {
    syncLog();
  };

  if (isSyncing) {
    return (
      <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle">
        <div>
          <Loader />
        </div>
      </div>
    );
  }

  if (syncError) {
    return (
      <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle">
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
      </div>
    );
  }

  return (
    <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle Log">
      <div className="uk-width-1-1">
        {logItems.map(
          ({
            uuid,
            userDisplayName,
            userImage,
            taskDescription,
            project,
            tags,
            startTimeString,
            endTimeString,
            hourlyRate,
            sum
          }) => (
            <div
              className="uk-card uk-card-default uk-card-small uk-margin"
              key={uuid}
            >
              <div className="uk-card-header uk-flex">
                <div className="uk-width-1-2 uk-width-2-3@l uk-padding-small uk-padding-remove-vertical uk-padding-remove-left">
                  {taskDescription}
                </div>
                <div className="uk-width-1-2 uk-width-1-3@l uk-padding-small uk-padding-remove-vertical uk-padding-remove-left uk-text-right">
                  {DateTime.fromISO(endTimeString)
                    .diff(DateTime.fromISO(startTimeString))
                    .toFormat("hh:mm:ss")}
                  {typeof sum === "number" ? " / $" + sum.toFixed(2) : null}
                </div>
              </div>
              <div className="uk-card-body uk-text-meta">
                <div
                  className="uk-child-width-1-1 uk-child-width-1-2@m uk-grid-small"
                  uk-grid="true"
                >
                  <div>
                    <div
                      className="uk-child-width-1-1 uk-grid-small"
                      uk-grid="true"
                    >
                      <div className="uk-grid-small" uk-grid="true">
                        <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                          {t("project")}:
                        </div>
                        <div className="uk-width-2-3">
                          {typeof project === "string" &&
                          project.trim().length > 0 ? (
                            project
                          ) : (
                            <>&mdash;</>
                          )}
                        </div>
                      </div>
                      <div className="uk-grid-small" uk-grid="true">
                        <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                          {t("tags")}:
                        </div>
                        <div className="uk-width-2-3">
                          {typeof tags === "string" &&
                          tags.trim().length > 0 ? (
                            <Tags
                              workspaceId={workspaceId}
                              tags={tags.split(",").map(tag => tag.trim())}
                            />
                          ) : (
                            <>&mdash;</>
                          )}
                        </div>
                      </div>
                      <div className="uk-grid-small" uk-grid="true">
                        <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                          {t("user")}:
                        </div>
                        <div className="uk-width-2-3">
                          <img
                            className="uk-border-circle user-image"
                            data-src={userImage || noImage}
                            width="16"
                            height="16"
                            alt=""
                            uk-img={userImage || noImage}
                          />{" "}
                          {userDisplayName}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div
                      className="uk-child-width-1-1 uk-grid-small"
                      uk-grid="true"
                    >
                      <div className="uk-grid-small" uk-grid="true">
                        <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                          {t("startedAt")}:
                        </div>
                        <div className="uk-width-2-3">
                          {DateTime.fromISO(startTimeString).toFormat(
                            "yyyy-MM-dd hh:mm:ss ZZZZ"
                          )}
                        </div>
                      </div>
                      <div className="uk-grid-small" uk-grid="true">
                        <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                          {t("finishedAt")}:
                        </div>
                        <div className="uk-width-2-3">
                          {DateTime.fromISO(endTimeString).toFormat(
                            "yyyy-MM-dd hh:mm:ss ZZZZ"
                          )}
                        </div>
                      </div>
                      <div className="uk-grid-small" uk-grid="true">
                        <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                          {t("hourlyRate")}:
                        </div>
                        <div className="uk-width-2-3">
                          {typeof hourlyRate === "number" ? (
                            "$" + hourlyRate.toFixed(2)
                          ) : (
                            <>&mdash;</>
                          )}
                        </div>
                      </div>
                      <div className="uk-grid-small" uk-grid="true">
                        <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                          {t("sum")}:
                        </div>
                        <div className="uk-width-2-3">
                          {typeof sum === "number" ? (
                            "$" + sum.toFixed(2)
                          ) : (
                            <>&mdash;</>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export { Log };

export default connect(
  (state, { workspaceId }) => ({
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
      .sort(
        (a, b) =>
          DateTime.fromISO(b.endTimeString) - DateTime.fromISO(a.endTimeString)
      )
  }),
  (dispatch, { workspaceId }) => ({
    fetchState: () => {
      dispatch(sync(workspaceId, "Log"));
    },
    syncLog: () => {
      dispatch(sync(workspaceId, "Log"));
    }
  })
)(Log);
