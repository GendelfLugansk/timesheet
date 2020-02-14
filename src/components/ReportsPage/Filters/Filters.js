import React, { memo, useCallback, useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  deserialize,
  getAvailableFilters,
  serialize
} from "../../../utils/logFilters";
import { TYPE_ISO_DATE } from "../../../actions/syncableStorage";
import Loader from "../../Loader/Loader";
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
import { isLogSyncingSelector, logSelector } from "../../../selectors/log";
import { setFilters } from "../../../actions/filters";
import { filtersSelector } from "../../../selectors/filters";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const FilterIncludes = memo(
  ({
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
                    const valuesCopy = [...values];
                    if (checked) {
                      if (!valuesCopy.includes(value)) {
                        valuesCopy.push(value);
                      }
                    } else {
                      valuesCopy.splice(valuesCopy.indexOf(value), 1);
                    }

                    requestAnimationFrame(() => {
                      requestAnimationFrame(() => {
                        applyFilter(key, type, valuesCopy);
                      });
                    });
                  }}
                />{" "}
                {value !== "" ? value : t("filters." + key + ".emptyValue")}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

const FilterBetweenDates = memo(
  ({
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

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            applyFilter(key, type, toApply);
          });
        });
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
                  formattedValues[0] =
                    "&ge;" + from.toFormat("yyyy-MM-dd HH:mm");
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
                            label: t(
                              `filters.${key}.formLabels.${context.label}`
                            )
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
  }
);

const availableFiltersSelector = state =>
  JSON.stringify(getAvailableFilters(logSelector(state)));

const Filters = memo(() => {
  const availableFilters = JSON.parse(useSelector(availableFiltersSelector));
  const appliedFilters = deserialize(useSelector(filtersSelector));
  const isSyncing = useSelector(isLogSyncingSelector, shallowEqual);
  const dispatch = useDispatch();

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

  const setAppliedFilters = useCallback(
    filters => {
      dispatch(setFilters(serialize(filters)));
    },
    [dispatch]
  );

  const applyFilterCallback = useCallback(
    (key, type, newValues) => {
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
    },
    [filters, setAppliedFilters]
  );

  if (isSyncing && availableFilters.length === 0) {
    return (
      <div className="uk-padding-small">
        <div className="uk-flex uk-flex-center uk-flex-middle uk-background-muted">
          <div className="uk-padding-small">
            <Loader ratio={1} />
          </div>
        </div>
      </div>
    );
  }

  if (availableFilters.length === 0) {
    return null;
  }

  return (
    <div className="uk-padding-small Filters">
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
              applyFilter={applyFilterCallback}
            />
          );
        }

        if (type === "between" && typeToCoerce === TYPE_ISO_DATE) {
          return (
            <FilterBetweenDates
              isSyncing={isSyncing}
              key={key + "_" + type}
              filterKey={key}
              type={type}
              availableValues={availableValues}
              values={values}
              applyFilter={applyFilterCallback}
            />
          );
        }

        return null;
      })}
    </div>
  );
});

export default Filters;
