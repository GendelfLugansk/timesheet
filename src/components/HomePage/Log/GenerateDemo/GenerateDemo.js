import React, { memo, useCallback, useState } from "react";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./GenerateDemo.en";
import ru from "./GenerateDemo.ru";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import uuidv4 from "uuid/v4";
import Loader from "../../../Loader/Loader";
import { replaceAllLocal, sync } from "../../../../actions/syncableStorage";
//eslint-disable-next-line import/no-webpack-loader-syntax
import worker from "workerize-loader!./worker";
import useTask from "../../../../hooks/useTask";
import { workspaceIdSelector } from "../../../../selectors/workspaces";
import { isLogSyncingSelector } from "../../../../selectors/log";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const selector = state => ({
  isLoading: isLogSyncingSelector(state),
  userId: state.auth.currentUser.id,
  userDisplayName: state.auth.currentUser.name,
  userImage: state.auth.currentUser.image,
  workspaceId: workspaceIdSelector(state)
});

const GenerateDemo = memo(() => {
  const {
    isLoading,
    userId,
    userDisplayName,
    userImage,
    workspaceId
  } = useSelector(selector, shallowEqual);
  const dispatch = useDispatch();
  const syncData = useCallback(async () => {
    await dispatch(sync(["Log", "Projects", "Tags"]));
  }, [dispatch]);
  const saveData = useCallback(
    ({ log, projects, tags }) => {
      dispatch(replaceAllLocal(workspaceId, "Log", log));
      dispatch(replaceAllLocal(workspaceId, "Projects", projects));
      dispatch(replaceAllLocal(workspaceId, "Tags", tags));
    },
    [dispatch, workspaceId]
  );
  const { t } = useTranslation(ns);
  const [years, setYears] = useState(5);

  const generateDemo = useTask(async (years = 5) => {
    const workerInstance = worker();
    const data = await workerInstance.generateDemoData(
      userDisplayName,
      userId,
      userImage,
      years
    );
    workerInstance.terminate();
    saveData(data);
    await syncData();
  });

  const buttonClick = () => {
    generateDemo.perform(years);
  };

  if (isLoading || generateDemo.isRunning) {
    return (
      <div className="uk-flex uk-flex-center uk-flex-middle">
        <Loader />
      </div>
    );
  }

  return (
    <div className="uk-flex uk-flex-center uk-flex-middle uk-flex-column">
      <div className="uk-width-1-1 uk-width-2-3@m uk-width-1-2@l">
        <form
          className="uk-padding-large"
          onSubmit={e => {
            e.preventDefault();
            buttonClick();
          }}
        >
          <div className="uk-legend">{t("intro")}</div>
          <div className="uk-margin">
            <label className="uk-form-label">{t("yearsToGenerate")}</label>
            <select
              className="uk-select"
              value={years}
              onChange={({ target: { value } }) => {
                setYears(value);
              }}
            >
              <option value={2}>2</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
            </select>
          </div>
          <div className="uk-margin">
            <button
              type="button"
              className="uk-button uk-button-primary uk-width-1-1"
              onClick={buttonClick}
            >
              {t("generateButton", { years })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export { GenerateDemo };

export default GenerateDemo;
