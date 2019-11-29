import React, { useState, useEffect } from "react";
import i18n from "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./CreateFirstWorkspace.en";
import ru from "./CreateFirstWorkspace.ru";
import Joi from "joi";
import groupJoiErrors from "../../../utils/groupJoiErrors";
import { connect } from "react-redux";
import { createWorkspace } from "../../../actions/workspaces";
import stringifyError from "../../../utils/stringifyError";
import LoaderFullPage from "../../Loader/LoaderFullPage/LoaderFullPage";
import useTask from "../../../hooks/useTask";

const ns = "CreateFirstWorkspace";
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const CreateFirstWorkspace = ({ createWorkspace }) => {
  const { t } = useTranslation(ns);
  const { t: tj } = useTranslation("joi");

  const [formData, setFormData] = useState({
    name: "Default",
    sortOrder: 0
  });
  const [validationErrors, setValidationErrors] = useState({});
  const create = useTask(createWorkspace);

  const validate = data => {
    const rules = Joi.object({
      name: Joi.string()
        .min(1)
        .required(),
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

  const maybeValidate = () => {
    try {
      //Re-validate if there are validation errors, don't touch otherwise
      if (
        Math.max(
          0,
          ...Object.values(validationErrors)
            .filter(a => Array.isArray(a))
            .map(a => a.length)
        ) > 0
      ) {
        validate(formData);
        setValidationErrors({});
      }
    } catch (e) {
      if (typeof e.groupedDetails === "object") {
        setValidationErrors(e.groupedDetails);
      }
    }
  };

  useEffect(maybeValidate, [formData]);

  const submit = () => {
    let cleanData;
    try {
      setValidationErrors({});
      cleanData = validate(formData);
    } catch (e) {
      setValidationErrors(e.groupedDetails);
      return;
    }

    create.perform(cleanData);
  };

  if (create.isRunning) {
    return <LoaderFullPage />;
  }

  return (
    <div className="uk-flex uk-flex-center uk-flex-middle min-height-100">
      <div className="uk-width-1-1 uk-width-2-3@m uk-width-1-2@l">
        <form
          onSubmit={e => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="uk-legend">{t("intro")}</div>

          <div className="uk-margin">
            <label className="uk-form-label">{t("form.nameLabel")}</label>
            <div className="uk-form-controls">
              <input
                className="uk-input"
                type="text"
                value={formData.name}
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

          {create.getLatestErrorIfNotCanceled() ? (
            <div className="uk-margin">
              <div className="uk-alert-danger" uk-alert="true">
                <button
                  className="uk-alert-close"
                  uk-close="true"
                  onClick={() => create.discardLatestError()}
                />
                {stringifyError(create.getLatestErrorIfNotCanceled())}
              </div>
            </div>
          ) : null}

          <div className="uk-margin">
            <button type="submit" className="uk-button uk-button-primary">
              {t("form.createButton")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { CreateFirstWorkspace };

export default connect(
  state => ({}),
  dispatch => ({
    createWorkspace: async data => {
      await dispatch(createWorkspace(data));
    }
  })
)(CreateFirstWorkspace);
