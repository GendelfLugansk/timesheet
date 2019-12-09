import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import objectPath from "object-path";
import {
  fetchWorkspaceData,
  updateWorkspaceDataTimerInProgress
} from "../../../actions/workspacesData";
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
  isLoading,
  error,
  timerInProgress,
  currentUser,
  fetchState,
  updateTimer,
  startTimer,
  stopTimer
}) => {
  const { t } = useTranslation(ns);

  useEffect(fetchState, []);

  const [spentTime, setSpentTime] = useState("00:00:00");
  const [spentSum, setSpentSum] = useState(null);

  const updateDisplayedTime = useRef();
  useEffect(() => {
    updateDisplayedTime.current = setInterval(() => {
      if (
        timerInProgress.started &&
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
      }
    }, 500);

    return () => {
      clearInterval(updateDisplayedTime.current);
    };
  });

  const start = () => {
    startTimer();
  };

  const stop = () => {
    stopTimer();
  };

  if (isLoading) {
    return (
      <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle">
        <div className="uk-width-1-1 uk-width-2-3@m uk-width-1-2@l">
          <div className="uk-alert-danger" uk-alert="true">
            {stringifyError(error)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle">
      <div className="uk-width-1-1 uk-width-2-3@m uk-width-1-2@l">
        <form className="uk-grid-small" uk-grid="" onSubmit={() => {}}>
          <div className="uk-width-1-1">
            <input
              className="uk-input"
              type="text"
              value={timerInProgress.taskDescription}
              placeholder={t("taskDescriptionPlaceholder")}
              onChange={({ target: { value } }) => {
                updateTimer({ ...timerInProgress, taskDescription: value });
              }}
            />
          </div>
          <div className="uk-width-1-3">
            <input
              className="uk-input"
              type="text"
              value={timerInProgress.project}
              placeholder={t("projectPlaceholder")}
              onChange={({ target: { value } }) => {
                updateTimer({ ...timerInProgress, project: value });
              }}
            />
          </div>
          <div className="uk-width-1-3">
            <input
              className="uk-input"
              type="text"
              value={timerInProgress.tags}
              placeholder={t("tagsPlaceholder")}
              onChange={({ target: { value } }) => {
                updateTimer({ ...timerInProgress, tags: value });
              }}
            />
          </div>
          <div className="uk-width-1-3">
            <input
              className="uk-input"
              type="text"
              value={timerInProgress.hourlyRate}
              placeholder={t("hourlyRatePlaceholder")}
              onChange={({ target: { value } }) => {
                updateTimer({
                  ...timerInProgress,
                  hourlyRate: value
                });
              }}
            />
          </div>
          <div className="uk-width-1-1 uk-text-center">
            <span className="uk-heading-large">{spentTime}</span>
            {spentSum ? (
              <span className="uk-heading-small">{" / $" + spentSum}</span>
            ) : null}
          </div>
          <div className="uk-width-1-1 uk-text-center">
            {!timerInProgress.started ? (
              <button
                className="uk-button uk-button-large uk-button-primary"
                type="button"
                onClick={start}
              >
                {t("startButton")}
              </button>
            ) : (
              <button
                className="uk-button uk-button-large uk-button-danger"
                type="button"
                onClick={stop}
              >
                {t("stopButton")}
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
    isLoading: objectPath.get(
      state.workspacesData,
      `${workspaceId}.isLoading`,
      false
    ),
    error: objectPath.get(state.workspacesData, `${workspaceId}.error`, null),
    timerInProgress: objectPath.get(
      state.workspacesData,
      `${workspaceId}.timerInProgress`,
      {}
    ),
    currentUser: state.auth.currentUser
  }),
  (dispatch, { workspaceId }) => ({
    fetchState: () => {
      dispatch(fetchWorkspaceData(workspaceId));
    },
    updateTimer: timerInProgress => {
      dispatch(
        updateWorkspaceDataTimerInProgress(workspaceId, timerInProgress)
      );
    },
    startTimer: () => {
      dispatch(
        updateWorkspaceDataTimerInProgress(workspaceId, {
          started: true,
          uuid: uuidv4(),
          startTimeString: DateTime.local().toISO()
        })
      );
    },
    stopTimer: () => {
      dispatch(
        updateWorkspaceDataTimerInProgress(workspaceId, { started: false })
      );
    }
  })
)(Timer);
