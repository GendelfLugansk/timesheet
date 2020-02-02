import React, { useState, useEffect } from "react";
import i18n from "../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./SelectWorkspace.en";
import ru from "./SelectWorkspace.ru";
import Joi from "joi";
import groupJoiErrors from "../../utils/groupJoiErrors";
import { connect } from "react-redux";
import LoaderFullPage from "../Loader/LoaderFullPage/LoaderFullPage";
import { selectWorkspace } from "../../actions/workspaces";
import objectPath from "object-path";
import uuidv4 from "uuid/v4";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const SelectWorkspace = ({ isLoading, workspaces, selectWorkspace }) => {
  const { t } = useTranslation(ns);
  const { t: tj } = useTranslation("joi");

  const [formData, setFormData] = useState({
    workspaceId: undefined
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validate = formData => {
    const rules = Joi.object({
      workspaceId: Joi.string().required()
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
      console.log(e.groupedDetails);
      setValidationErrors(e.groupedDetails);
      return;
    }

    selectWorkspace(
      workspaces.filter(({ id }) => id === cleanData.workspaceId)[0]
    );
  };

  if (isLoading) {
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
            <label className="uk-form-label">
              {t("form.workspaceIdLabel")} *
            </label>
            <div className="uk-form-controls">
              <div uk-form-custom="target: > * > span:first-child">
                <select
                  value={formData.workspaceId}
                  onChange={({ target: { value } }) => {
                    setFormData({ ...formData, workspaceId: value });
                  }}
                >
                  <option value="">{t("form.workspaceIdPlaceholder")}</option>
                  {workspaces.map(workspace => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.nameShort} &mdash;{" "}
                      {objectPath.get(workspace, "owners.0.displayName")}
                    </option>
                  ))}
                </select>
                <button
                  className={`uk-button uk-button-default ${
                    Array.isArray(validationErrors.workspaceId) &&
                    validationErrors.workspaceId.length > 0
                      ? "uk-form-danger"
                      : ""
                  }`}
                  type="button"
                  tabIndex="-1"
                >
                  <span />
                  <span uk-icon="icon: chevron-down" />
                </button>
              </div>
            </div>
            {Array.isArray(validationErrors.workspaceId) &&
            validationErrors.workspaceId.length > 0 ? (
              <div className="uk-alert-danger" uk-alert="true">
                <ul>
                  {validationErrors.workspaceId.map(({ type, context }) => (
                    <li key={type}>
                      {tj(type, {
                        ...context,
                        label: t("form.workspaceIdLabel")
                      })}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="uk-margin">
            <button type="submit" className="uk-button uk-button-primary">
              {t("form.selectButton")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { SelectWorkspace };

export default connect(
  state => ({
    isLoading: state.workspaces.isLoading,
    workspaces: state.workspaces.list
  }),
  dispatch => ({
    selectWorkspace: workspace => {
      dispatch(selectWorkspace(workspace));
    }
  })
)(SelectWorkspace);
