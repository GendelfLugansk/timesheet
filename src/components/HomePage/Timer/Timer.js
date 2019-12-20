import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import objectPath from "object-path";
import {
  sync,
  upsertLocal,
  deleteLocal
} from "../../../actions/syncableStorage";
import Loader from "../../Loader/Loader";
import stringifyError from "../../../utils/stringifyError";
import uuidv4 from "uuid/v4";
import i18n from "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./Timer.en";
import ru from "./Timer.ru";
import { DateTime } from "luxon";
import Joi from "joi";

const ns = "Timer";
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const Timer = ({
  isSyncing,
  syncError,
  timerInProgress,
  isTagsSyncing,
  tagItems,
  fetchState,
  updateTimer,
  updateTags,
  startTimer,
  stopTimer,
  syncAll,
  syncProgress,
  syncTags
}) => {
  const { t } = useTranslation(ns);
  const { t: tj } = useTranslation("joi");

  useEffect(fetchState, []);

  const [spentTime, setSpentTime] = useState("00:00:00");
  const [spentSum, setSpentSum] = useState(null);
  const [hourlyRateValidationErrors, setHourlyRateValidationErrors] = useState(
    null
  );

  const updateDisplayedTime = useRef();
  useEffect(() => {
    updateDisplayedTime.current = setInterval(() => {
      if (
        !Joi.validate(
          timerInProgress,
          Joi.object({
            startTimeString: Joi.date()
              .iso()
              .required()
          }),
          { allowUnknown: true }
        ).error
      ) {
        const duration = DateTime.local().diff(
          DateTime.fromISO(timerInProgress.startTimeString)
        );

        setSpentTime(duration.toFormat("hh:mm:ss"));

        if (
          !Joi.validate(
            timerInProgress,
            Joi.object({
              hourlyRate: Joi.number()
                .min(0)
                .required()
            }),
            { allowUnknown: true }
          ).error
        ) {
          setSpentSum(
            (
              Number(timerInProgress.hourlyRate) * Number(duration.as("hours"))
            ).toFixed(2)
          );
        } else {
          setSpentSum(null);
        }
      } else {
        setSpentTime("00:00:00");
        setSpentSum(null);
      }
    }, 500);

    return () => {
      clearInterval(updateDisplayedTime.current);
    };
  });

  const getTagsToAdd = tagsStr => {
    let tagsToAdd = [];

    if (!isTagsSyncing) {
      const existingTagNames = Object.values(tagItems).map(({ name }) => name);
      tagsToAdd = tagsStr
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "")
        .filter(tag => !existingTagNames.includes(tag))
        .map(name => ({ name, uuid: uuidv4() }));
    }

    return tagsToAdd;
  };

  const inputsBlur = () => {
    if (timerInProgress.startTimeString && timerInProgress.uuid) {
      syncProgress();
    }
  };

  const tagsInputBlur = () => {
    if (timerInProgress.startTimeString && timerInProgress.uuid) {
      updateTags(getTagsToAdd(timerInProgress.tags));
      syncProgress();
      syncTags();
    }
  };

  const start = () => {
    startTimer(timerInProgress, getTagsToAdd(timerInProgress.tags));
  };

  const stop = () => {
    stopTimer(timerInProgress);
  };

  const syncRetry = () => {
    syncAll();
  };

  return (
    <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle">
      <div className="uk-width-1-1 uk-width-1-2@l">
        <form className="uk-grid-small" uk-grid="" onSubmit={() => {}}>
          <div className="uk-width-1-1">
            <input
              className="uk-input"
              type="text"
              value={
                typeof timerInProgress.taskDescription === "string"
                  ? timerInProgress.taskDescription
                  : ""
              }
              placeholder={t("taskDescriptionPlaceholder")}
              disabled={isSyncing}
              onChange={({ target: { value } }) => {
                updateTimer({ ...timerInProgress, taskDescription: value });
              }}
              onBlur={inputsBlur}
            />
          </div>
          <div className="uk-width-1-3">
            <input
              className="uk-input"
              type="text"
              value={
                typeof timerInProgress.project === "string"
                  ? timerInProgress.project
                  : ""
              }
              placeholder={t("projectPlaceholder")}
              disabled={isSyncing}
              onChange={({ target: { value } }) => {
                updateTimer({ ...timerInProgress, project: value });
              }}
              onBlur={inputsBlur}
            />
          </div>
          <div className="uk-width-1-3">
            <input
              className="uk-input"
              type="text"
              value={
                typeof timerInProgress.tags === "string"
                  ? timerInProgress.tags
                  : ""
              }
              placeholder={t("tagsPlaceholder")}
              disabled={isSyncing}
              onChange={({ target: { value } }) => {
                updateTimer({ ...timerInProgress, tags: value });
              }}
              onBlur={tagsInputBlur}
            />
          </div>
          <div className="uk-width-1-3">
            <input
              className={`uk-input ${
                Array.isArray(hourlyRateValidationErrors) &&
                hourlyRateValidationErrors.length > 0
                  ? "uk-form-danger"
                  : ""
              }`}
              type="text"
              value={
                ["string", "number"].includes(typeof timerInProgress.hourlyRate)
                  ? timerInProgress.hourlyRate
                  : ""
              }
              placeholder={t("hourlyRatePlaceholder")}
              disabled={isSyncing}
              onChange={({ target: { value } }) => {
                const validationResult = Joi.validate(
                  value,
                  Joi.number()
                    .min(0)
                    .allow(""),
                  { abortEarly: false }
                );
                setHourlyRateValidationErrors(
                  validationResult.error
                    ? validationResult.error.details.map(
                        ({ type, context }) => ({
                          type,
                          context
                        })
                      )
                    : null
                );
                updateTimer({
                  ...timerInProgress,
                  hourlyRate: !validationResult.error
                    ? validationResult.value
                    : value
                });
              }}
              onBlur={inputsBlur}
            />
          </div>
          {Array.isArray(hourlyRateValidationErrors) &&
          hourlyRateValidationErrors.length > 0 ? (
            <div className="uk-width-1-1">
              <div className="uk-alert-danger" uk-alert="true">
                <ul>
                  {hourlyRateValidationErrors.map(({ type, context }) => (
                    <li key={type}>
                      {tj(type, { ...context, label: t("hourlyRateLabel") })}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
          <div className="uk-width-1-1 uk-text-center">
            <span className="uk-heading-large">{spentTime}</span>
            {spentSum ? (
              <span className="uk-heading-small">{" / $" + spentSum}</span>
            ) : null}
          </div>
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
          <div className="uk-width-1-1 uk-text-center">
            {timerInProgress.startTimeString && timerInProgress.uuid ? (
              <button
                className="uk-button uk-button-large uk-button-danger"
                type="button"
                disabled={isSyncing}
                onClick={stop}
              >
                {isSyncing ? <Loader ratio={1} /> : t("stopButton")}
              </button>
            ) : (
              <button
                className="uk-button uk-button-large uk-button-primary"
                type="button"
                disabled={isSyncing}
                onClick={start}
              >
                {isSyncing ? <Loader ratio={1} /> : t("startButton")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export { Timer };

export default connect(
  (state, { workspaceId }) => ({
    isSyncing: objectPath.get(
      state.syncableStorage,
      `${workspaceId}.Progress.isSyncing`,
      false
    ),
    syncError: objectPath.get(
      state.syncableStorage,
      `${workspaceId}.Progress.error`,
      null
    ),
    timerInProgress: {
      uuid: uuidv4(),
      ...(objectPath
        .get(state.syncableStorage, `${workspaceId}.Progress.data`, [])
        .filter(({ _deleted }) => !_deleted)
        .filter(row => row.userId === state.auth.currentUser.id)[0] || {}),
      userId: state.auth.currentUser.id,
      userDisplayName: state.auth.currentUser.name,
      userImage: state.auth.currentUser.image
    },
    isTagsSyncing: objectPath.get(
      state.syncableStorage,
      `${workspaceId}.Tags.isSyncing`,
      false
    ),
    tagItems: objectPath
      .get(state.syncableStorage, `${workspaceId}.Tags.data`, [])
      .filter(({ _deleted }) => !_deleted)
  }),
  (dispatch, { workspaceId }) => ({
    fetchState: () => {
      (async () => {
        await dispatch(sync(workspaceId, "Progress"));
        await dispatch(sync(workspaceId, "Tags"));
      })();
    },
    updateTimer: timerInProgress => {
      dispatch(upsertLocal(workspaceId, "Progress", timerInProgress));
    },
    updateTags: tags => {
      tags.forEach(tag => dispatch(upsertLocal(workspaceId, "Tags", tag)));
    },
    startTimer: (timerInProgress, tags = []) => {
      dispatch(
        upsertLocal(workspaceId, "Progress", {
          ...timerInProgress,
          startTimeString: DateTime.local().toISO()
        })
      );
      tags.forEach(tag => dispatch(upsertLocal(workspaceId, "Tags", tag)));
      (async () => {
        dispatch(sync(workspaceId, "Progress"));
        dispatch(sync(workspaceId, "Tags"));
      })();
    },
    stopTimer: timerInProgress => {
      const endTimeString = DateTime.local().toISO();
      const durationHours = DateTime.fromISO(endTimeString)
        .diff(DateTime.fromISO(timerInProgress.startTimeString))
        .as("hours");
      const logEntry = {
        ...timerInProgress,
        endTimeString: endTimeString,
        durationHours: durationHours,
        sum:
          typeof durationHours === "number" &&
          typeof timerInProgress.hourlyRate === "number" &&
          durationHours > 0 &&
          timerInProgress.hourlyRate > 0
            ? durationHours * timerInProgress.hourlyRate
            : undefined
      };
      dispatch(upsertLocal(workspaceId, "Log", logEntry));
      dispatch(deleteLocal(workspaceId, "Progress", timerInProgress.uuid));

      (async () => {
        await dispatch(sync(workspaceId, "Log"));
        await dispatch(sync(workspaceId, "Progress"));
      })();
    },
    syncAll: () => {
      (async () => {
        await dispatch(sync(workspaceId, "Log"));
        await dispatch(sync(workspaceId, "Progress"));
        await dispatch(sync(workspaceId, "Tags"));
      })();
    },
    syncProgress: () => {
      dispatch(sync(workspaceId, "Progress"));
    },
    syncTags: () => {
      dispatch(sync(workspaceId, "Tags"));
    }
  })
)(Timer);
