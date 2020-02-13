import React, { memo } from "react";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./RemoveCurrentWorkspace.en";
import ru from "./RemoveCurrentWorkspace.ru";
import { useDispatch, useSelector } from "react-redux";
import {
  removeWorkspace,
  selectWorkspace
} from "../../../../actions/workspaces";
import stringifyError from "../../../../utils/stringifyError";
import LoaderFullPage from "../../../Loader/LoaderFullPage/LoaderFullPage";
import useTask from "../../../../hooks/useTask";
import uuidv4 from "uuid/v4";
import { clearLocalWorkspace } from "../../../../actions/syncableStorage";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const selector = state => state.workspaces.currentWorkspace;

const RemoveCurrentWorkspace = memo(
  ({ onCancel = () => {}, onRemove = () => {} }) => {
    const dispatch = useDispatch();
    const currentWorkspace = useSelector(selector);
    const { t } = useTranslation(ns);

    const remove = useTask(async id => {
      await dispatch(removeWorkspace(id));
      dispatch(clearLocalWorkspace(id));
      dispatch(selectWorkspace(undefined));
      onRemove();
    });

    const removeButtonClick = () => {
      remove.perform(currentWorkspace.id);
    };

    if (remove.isRunning) {
      return <LoaderFullPage />;
    }

    return (
      <div>
        <p>{t("intro", { name: (currentWorkspace || {}).nameShort })}</p>

        {remove.getLatestInstanceErrorIfNotCanceled() ? (
          <div className="uk-margin">
            <div className="uk-alert-danger" uk-alert="true">
              <button
                className="uk-alert-close"
                uk-close="true"
                onClick={() => remove.discardLatestInstanceError()}
              />
              {stringifyError(remove.getLatestInstanceErrorIfNotCanceled())}
            </div>
          </div>
        ) : null}

        <div className="uk-margin uk-text-right uk-margin-remove-bottom">
          <button
            type="button"
            className="uk-button uk-button-default"
            onClick={() => {
              remove.discardLatestInstanceError();
              onCancel();
            }}
          >
            {t("cancelButton")}
          </button>{" "}
          <button
            type="button"
            className="uk-button uk-button-danger"
            onClick={removeButtonClick}
          >
            {t("removeButton")}
          </button>
        </div>
      </div>
    );
  }
);

export { RemoveCurrentWorkspace };

export default RemoveCurrentWorkspace;
