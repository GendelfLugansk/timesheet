import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import objectPath from "object-path";
import { getAvailableFilters } from "../../../utils/logFilters";
import { sync } from "../../../actions/syncableStorage";
import Loader from "../../Loader/Loader";
import stringifyError from "../../../utils/stringifyError";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";
import en from "./Filters.en";
import ru from "./Filters.ru";
import { DateTime } from "luxon";
import groupJoiErrors from "../../../utils/groupJoiErrors";
import Joi from "joi";
import ReactHtmlParser from "react-html-parser";
import LoaderOverlay from "../../Loader/LoaderOverlay/LoaderOverlay";
import "./Filters.scss";
import uuidv4 from "uuid/v4";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const FilterIncludes = ({
  isSyncing,
  filterKey: key,
  type,
  availableValues,
  values,
  applyFilter
}) => {
  const { t } = useTranslation(ns);

  return (
    <div className="uk-inline uk-margin-small-bottom uk-margin-small-right">
      <button
        className={
          "uk-button" +
          (values.length > 0 ? " uk-button-primary" : " uk-button-default")
        }
        type="button"
      >
        {t("filters." + key + ".title", {
          selectedQty:
            values.length === 0
              ? t("filters." + key + ".anySelected")
              : values.length <= 5
              ? values
                  .map(v =>
                    v !== "" ? v : t("filters." + key + ".emptyValue")
                  )
                  .join(", ")
              : values.length
        })}
      </button>
      <div
        className="uk-card uk-card-body uk-card-default uk-overflow-auto uk-height-max-large"
        uk-dropdown="mode: click"
      >
        {isSyncing ? (
          <LoaderOverlay
            ratio={Math.min(
              3,
              Math.max(Math.ceil(availableValues.length / 2), 1)
            )}
            opacity={0.96}
          />
        ) : null}
        <div
          className="uk-width-large@m uk-child-width-1-1 uk-child-width-1-2@m uk-grid-small uk-text-small"
          uk-grid="true"
        >
          {availableValues.map((value, index) => (
            <div key={key + "_" + type + "_" + index}>
              <input
                className="uk-checkbox"
                type="checkbox"
                checked={values.includes(value)}
                onChange={({ target: { checked } }) => {
                  if (checked) {
                    if (!values.includes(value)) {
                      values.push(value);
                    }
                  } else {
                    values.splice(values.indexOf(value), 1);
                  }
                  applyFilter(
                    checked
                      ? [...new Set([...values, value])]
                      : values.filter(v => v !== value)
                  );
                }}
              />{" "}
              {value !== "" ? value : t("filters." + key + ".emptyValue")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FilterBetweenDates = ({
  isSyncing,
  filterKey: key,
  type,
  availableValues,
  values,
  applyFilter
}) => {
  const { t } = useTranslation(ns);
  const { t: tj } = useTranslation("joi");
  const [validationErrors, setValidationErrors] = useState({});
  const [localState, setLocalState] = useState({});

  useEffect(() => {
    setLocalState(previousState => {
      if (
        !previousState.hasOwnProperty("from") &&
        !previousState.hasOwnProperty("to") &&
        Array.isArray(values) &&
        values.length > 0
      ) {
        return {
          from:
            values[0] && values[0].toISO && values[0].isValid
              ? values[0].toISO(values[0])
              : values[0],
          to:
            values[1] && values[1].toISO && values[1].isValid
              ? values[1].toISO(values[1])
              : values[1]
        };
      }

      return previousState;
    });
  }, [values, setLocalState]);

  const maybeApplyFilter = localState => {
    const rules = Joi.object({
      from: Joi.date()
        .iso()
        .optional(),
      to: Joi.date()
        .iso()
        .when("from", {
          is: Joi.date()
            .iso()
            .required(),
          then: Joi.date().min(Joi.ref("from"))
        })
        .optional()
    });

    const validationResult = Joi.validate(localState, rules, {
      abortEarly: false,
      stripUnknown: { objects: true }
    });

    if (validationResult.error === null) {
      setValidationErrors({});
      const toApply = [undefined, undefined];

      if (localState.from) {
        toApply[0] = localState.from;
      }
      if (localState.to) {
        toApply[1] = localState.to;
      }
      applyFilter(toApply);
    } else {
      setValidationErrors(
        groupJoiErrors(validationResult.error).groupedDetails
      );
    }
  };

  return (
    <div className="uk-inline uk-margin-small-bottom uk-margin-small-right">
      <button
        className={
          "uk-button" +
          (values.filter(v => ![undefined, ""].includes(v)).length > 0
            ? " uk-button-primary"
            : " uk-button-default")
        }
        type="button"
      >
        {ReactHtmlParser(
          t("filters." + key + ".title", {
            filterValues: ((values, key) => {
              if (
                values.filter(v => ![undefined, ""].includes(v)).length === 0
              ) {
                return t("filters." + key + ".anySelected");
              }

              const formattedValues = Array(2);

              const from = DateTime.fromISO(values[0]);
              if (from.isValid) {
                formattedValues[0] = "&ge;" + from.toFormat("yyyy-MM-dd HH:mm");
              }

              const to = DateTime.fromISO(values[1]);
              if (to.isValid) {
                formattedValues[1] = "&le;" + to.toFormat("yyyy-MM-dd HH:mm");
              }

              return formattedValues.filter(v => v !== undefined).join("; ");
            })(values, key)
          })
        )}
      </button>
      <div
        className="uk-card uk-card-body uk-card-default uk-overflow-auto uk-height-max-large"
        uk-dropdown="mode: click"
      >
        {isSyncing ? <LoaderOverlay ratio={2} opacity={0.96} /> : null}
        <form
          className="uk-width-large@m uk-child-width-1-1 uk-child-width-1-2@m uk-grid-small uk-text-small"
          uk-grid="true"
        >
          <div>
            <label className="uk-form-label">
              {t(`filters.${key}.formLabels.from`)}
            </label>
            <div className="uk-form-controls">
              <input
                className={`uk-input uk-form-small ${
                  Array.isArray(validationErrors.from) &&
                  validationErrors.from.length > 0
                    ? "uk-form-danger"
                    : ""
                }`}
                type="text"
                value={
                  typeof localState.from === "string" ? localState.from : ""
                }
                onChange={({ target: { value } }) => {
                  const newLocalState = {
                    ...localState,
                    from: value === "" ? undefined : value
                  };
                  setLocalState(newLocalState);
                  maybeApplyFilter(newLocalState);
                }}
              />
            </div>
          </div>
          <div>
            <label className="uk-form-label">
              {t(`filters.${key}.formLabels.to`)}
            </label>
            <div className="uk-form-controls">
              <input
                className={`uk-input uk-form-small ${
                  Array.isArray(validationErrors.to) &&
                  validationErrors.to.length > 0
                    ? "uk-form-danger"
                    : ""
                }`}
                type="text"
                value={typeof localState.to === "string" ? localState.to : ""}
                onChange={({ target: { value } }) => {
                  const newLocalState = {
                    ...localState,
                    to: value === "" ? undefined : value
                  };
                  setLocalState(newLocalState);
                  maybeApplyFilter(newLocalState);
                }}
              />
            </div>
          </div>
          {Math.max(
            ...Object.values(validationErrors).map(({ length }) => length)
          ) > 0 ? (
            <div className="uk-width-1-1">
              <div className="uk-alert-danger" uk-alert="true">
                <ul>
                  {[]
                    .concat(...Object.values(validationErrors))
                    .map(({ type, context }) => (
                      <li key={type}>
                        {tj(type, {
                          ...context,
                          label: t(`filters.${key}.formLabels.${context.label}`)
                        })}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
};

const Filters = ({
  isSyncing,
  syncError,
  availableFilters = [],
  appliedFilters = [],
  setAppliedFilters,
  fetchState
}) => {
  const { t } = useTranslation(ns);
  useEffect(() => {
    if (availableFilters.length === 0) {
      fetchState();
    }
  }, [availableFilters.length, fetchState]);

  const syncRetry = () => {
    fetchState();
  };

  const filters = availableFilters
    .map(({ key, type, availableValues, typeToCoerce }) => ({
      key,
      type,
      availableValues: [...availableValues],
      typeToCoerce,
      values: [].concat(
        ...appliedFilters
          .filter(
            appliedFilter =>
              appliedFilter.key === key && appliedFilter.type === type
          )
          .map(({ values }) => values)
      )
    }))
    .concat(
      appliedFilters
        .filter(
          ({ key, type }) =>
            !availableFilters
              .map(({ key, type }) => key + "_" + type)
              .includes(key + "_" + type)
        )
        .map(({ key, type, values, typeToCoerce }) => ({
          key,
          type,
          availableValues: [...values],
          typeToCoerce,
          values
        }))
    );

  if (isSyncing && availableFilters.length === 0) {
    return (
      <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle">
        <div>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="uk-padding-small Filters">
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

      {filters.map(({ key, type, availableValues, values, typeToCoerce }) => {
        if (type === "includes") {
          return (
            <FilterIncludes
              isSyncing={isSyncing}
              key={key + "_" + type}
              filterKey={key}
              type={type}
              availableValues={availableValues}
              values={values}
              applyFilter={newValues => {
                setAppliedFilters(
                  filters
                    .map(filter => ({
                      key: filter.key,
                      type: filter.type,
                      values:
                        filter.key === key && filter.type === type
                          ? newValues
                          : filter.values,
                      typeToCoerce: filter.typeToCoerce
                    }))
                    .filter(({ values }) => values.length > 0)
                );
              }}
            />
          );
        }

        if (type === "between" && typeToCoerce === "DateTime") {
          return (
            <FilterBetweenDates
              isSyncing={isSyncing}
              key={key + "_" + type}
              filterKey={key}
              type={type}
              availableValues={availableValues}
              values={values}
              applyFilter={newValues => {
                setAppliedFilters(
                  filters
                    .map(filter => ({
                      key: filter.key,
                      type: filter.type,
                      values:
                        filter.key === key && filter.type === type
                          ? newValues
                          : filter.values,
                      typeToCoerce: filter.typeToCoerce
                    }))
                    .filter(({ values }) => values.length > 0)
                );
              }}
            />
          );
        }

        return null;
      })}
    </div>
  );
};

export default connect(
  (state, { workspaceId, isSyncing }) => ({
    isSyncing:
      objectPath.get(
        state.syncableStorage,
        `${workspaceId}.Log.isSyncing`,
        false
      ) || isSyncing,
    syncError: objectPath.get(
      state.syncableStorage,
      `${workspaceId}.Log.error`,
      null
    ),
    availableFilters: getAvailableFilters(
      objectPath
        .get(state.syncableStorage, `${workspaceId}.Log.data`, [])
        .filter(({ _deleted }) => !_deleted)
    )
  }),
  (dispatch, { workspaceId }) => ({
    fetchState: () => {
      dispatch(sync(workspaceId, "Log"));
    }
  })
)(Filters);
