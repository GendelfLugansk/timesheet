import React from "react";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./GenerateDemo.en";
import ru from "./GenerateDemo.ru";
import { connect } from "react-redux";
import uuidv4 from "uuid/v4";
import Loader from "../../../Loader/Loader";
import { sync, replaceAllLocal } from "../../../../actions/syncableStorage";
//eslint-disable-next-line import/no-webpack-loader-syntax
import worker from "workerize-loader!./worker";
import useTask from "../../../../hooks/useTask";
import { isSyncing } from "../../../../selectors/syncableStorage";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const GenerateDemo = ({
  isLoading,
  sync,
  save,
  userId,
  userDisplayName,
  userImage
}) => {
  const { t } = useTranslation(ns);

  const generateDemo = useTask(async () => {
    const workerInstance = worker();
    const data = await workerInstance.generateDemoData(
      userDisplayName,
      userId,
      userImage
    );
    workerInstance.terminate();
    save(data);
    await sync();
  });

  const buttonClick = () => {
    generateDemo.perform();
  };

  if (isLoading || generateDemo.isRunning) {
    return (
      <div className="uk-flex uk-flex-center uk-flex-middle">
        <Loader />
      </div>
    );
  }

  return (
    <div className="uk-flex uk-flex-center uk-flex-middle">
      <div className="uk-text-center uk-width-1-1 uk-width-2-3@m uk-width-1-2@l">
        <div className="uk-padding-small">{t("intro")}</div>
        <div className="uk-padding-small uk-padding-remove-top">
          <button
            type="button"
            className="uk-button uk-button-danger"
            onClick={buttonClick}
          >
            {t("generateButton")}
          </button>
        </div>
      </div>
    </div>
  );
};

export { GenerateDemo };

export default connect(
  (state, { workspaceId }) => ({
    isLoading: isSyncing(state, workspaceId, "Log"),
    userId: state.auth.currentUser.id,
    userDisplayName: state.auth.currentUser.name,
    userImage: state.auth.currentUser.image
  }),
  (dispatch, { workspaceId }) => ({
    sync: async () => {
      await dispatch(sync(workspaceId, ["Log", "Projects", "Tags"]));
    },
    save: ({ log, projects, tags }) => {
      dispatch(replaceAllLocal(workspaceId, "Log", log));
      dispatch(replaceAllLocal(workspaceId, "Projects", projects));
      dispatch(replaceAllLocal(workspaceId, "Tags", tags));
    }
  })
)(GenerateDemo);
