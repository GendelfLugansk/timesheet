import React, { useEffect, useState, memo } from "react";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./EditCurrentWorkspace.en";
import ru from "./EditCurrentWorkspace.ru";
import Joi from "joi";
import groupJoiErrors from "../../../../utils/groupJoiErrors";
import { useDispatch, useSelector } from "react-redux";
import { editWorkspace } from "../../../../actions/workspaces";
import stringifyError from "../../../../utils/stringifyError";
import LoaderFullPage from "../../../Loader/LoaderFullPage/LoaderFullPage";
import useTask from "../../../../hooks/useTask";
import uuidv4 from "uuid/v4";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const selector = state => state.workspaces.currentWorkspace;

const EditCurrentWorkspace = memo(
  ({ onCancel = () => {}, onEdit = () => {} }) => {
    const currentWorkspace = useSelector(selector);
    const dispatch = useDispatch();
    const { t } = useTranslation(ns);
    const { t: tj } = useTranslation("joi");

    const [formData, setFormData] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const edit = useTask(async (id, data) => {
      await dispatch(editWorkspace(id, data));
      setFormData(state => ({
        ...state,
        ...data
      }));
      onEdit();
    });

    const failSafeCurrentWorkspace = currentWorkspace || {};
    useEffect(() => {
      setFormData(state => ({
        ...state,
        name: failSafeCurrentWorkspace.nameShort || ""
      }));
    }, [failSafeCurrentWorkspace.nameShort]);

    useEffect(() => {
      setFormData(state => ({
        ...state,
        sortOrder: failSafeCurrentWorkspace.sortOrder || 0
      }));
    }, [failSafeCurrentWorkspace.sortOrder]);

    const validate = formData => {
      const rules = Joi.object({
        name: Joi.string().required(),
        sortOrder: Joi.number()
          .integer()
          .required()
      });

      const validationResult = Joi.validate(formData, rules, {
        abortEarly: false,
        stripUnknown: { objects: true }
      });

      if (validationResult.error === null) {
        return validationResult.value;
      }

      throw groupJoiErrors(validationResult.error);
    };

    const needReValidation =
      Math.max(
        0,
        ...Object.values(validationErrors)
          .filter(a => Array.isArray(a))
          .map(a => a.length)
      ) > 0;
    useEffect(() => {
      try {
        if (needReValidation) {
          validate(formData);
          setValidationErrors({});
        }
      } catch (e) {
        if (typeof e.groupedDetails === "object") {
          setValidationErrors(e.groupedDetails);
        }
      }
    }, [formData, needReValidation]);

    const submit = () => {
      let cleanData;
      try {
        setValidationErrors({});
        cleanData = validate(formData);
      } catch (e) {
        setValidationErrors(e.groupedDetails);
        return;
      }

      edit.perform(currentWorkspace.id, cleanData);
    };

    if (edit.isRunning) {
      return <LoaderFullPage />;
    }

    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="uk-legend">{t("intro")}</div>

        <div className="uk-margin">
          <label className="uk-form-label">{t("form.nameLabel")} *</label>
          <div className="uk-form-controls">
            <input
              className={`uk-input ${
                Array.isArray(validationErrors.name) &&
                validationErrors.name.length > 0
                  ? "uk-form-danger"
                  : ""
              }`}
              type="text"
              value={typeof formData.name === "string" ? formData.name : ""}
              onChange={({ target: { value } }) => {
                setFormData({ ...formData, name: value });
              }}
            />
          </div>
          {Array.isArray(validationErrors.name) &&
          validationErrors.name.length > 0 ? (
            <div className="uk-alert-danger" uk-alert="true">
              <ul>
                {validationErrors.name.map(({ type, context }) => (
                  <li key={type}>
                    {tj(type, { ...context, label: t("form.nameLabel") })}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {Array.isArray(validationErrors.sortOrder) &&
        validationErrors.sortOrder.length > 0 ? (
          <div className="uk-margin">
            <div className="uk-alert-danger" uk-alert="true">
              <ul>
                {validationErrors.sortOrder.map(({ type, context }) => (
                  <li key={type}>{tj(type, context)}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {edit.getLatestInstanceErrorIfNotCanceled() ? (
          <div className="uk-margin">
            <div className="uk-alert-danger" uk-alert="true">
              <button
                className="uk-alert-close"
                uk-close="true"
                onClick={() => edit.discardLatestInstanceError()}
              />
              {stringifyError(edit.getLatestInstanceErrorIfNotCanceled())}
            </div>
          </div>
        ) : null}

        <div className="uk-margin uk-text-right uk-margin-remove-bottom">
          <button
            type="button"
            className="uk-button uk-button-default"
            onClick={() => {
              setFormData({
                name: failSafeCurrentWorkspace.nameShort || "",
                sortOrder: failSafeCurrentWorkspace.sortOrder || 0
              });
              setValidationErrors({});
              edit.discardLatestInstanceError();
              onCancel();
            }}
          >
            {t("form.cancelButton")}
          </button>{" "}
          <button type="submit" className="uk-button uk-button-primary">
            {t("form.editButton")}
          </button>
        </div>
      </form>
    );
  }
);

export { EditCurrentWorkspace };

export default EditCurrentWorkspace;
