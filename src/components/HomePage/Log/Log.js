import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  deleteLocal,
  sync,
  upsertLocal
} from "../../../actions/syncableStorage";
import { DateTime, Duration } from "luxon";
import "./Log.scss";
import noImage from "./no-image.png";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";
import en from "./Log.en";
import ru from "./Log.ru";
import Tags from "./Tags/Tags";
import Loader from "../../Loader/Loader";
import stringifyError from "../../../utils/stringifyError";
import JoiBase from "joi";
import groupJoiErrors from "../../../utils/groupJoiErrors";
import LoaderOverlay from "../../Loader/LoaderOverlay/LoaderOverlay";
import uuidv4 from "uuid/v4";
import { stringArray } from "../../../utils/joiExtensions";
import theme from "../../../styles/autosuggestTheme";
import Autosuggest from "react-autosuggest";
import GenerateDemo from "./GenerateDemo/GenerateDemo";
import {
  getError,
  isSyncing,
  findMany
} from "../../../selectors/syncableStorage";

const Joi = JoiBase.extend(stringArray(JoiBase));

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const Log = ({
  workspaceId,
  isSyncing,
  syncError,
  logItems,
  isTagsSyncing,
  tagItems,
  isProjectsSyncing,
  projectItems,
  syncAll,
  deleteItem,
  saveItem
}) => {
  const { t } = useTranslation(ns);
  const { t: tj } = useTranslation("joi");

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(logItems.length / itemsPerPage));
  const [page, setPage] = useState(1);
  const [uuidToRemove, setUuidToRemove] = useState(null);
  const [entryToEdit, setEntryToEdit] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const realCurrentPage = Math.min(totalPages, Math.max(1, page));
  const pagedItems = logItems.slice(
    itemsPerPage * (realCurrentPage - 1),
    itemsPerPage * (realCurrentPage - 1) + itemsPerPage
  );

  const validate = formData => {
    const rules = Joi.object({
      taskDescription: Joi.string()
        .allow("")
        .trim()
        .optional(),
      project: Joi.string()
        .allow("")
        .trim()
        .optional(),
      tags: Joi.stringArray()
        .items(Joi.string().trim())
        .unique()
        .raw()
        .optional(),
      startTimeString: Joi.date()
        .iso()
        .raw()
        .required(),
      endTimeString: Joi.date()
        .iso()
        .raw()
        .min(Joi.ref("startTimeString"))
        .required(),
      hourlyRate: Joi.number()
        .min(0)
        .allow("")
        .optional()
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
    entryToEdit &&
    entryToEdit.uuid &&
    Math.max(
      0,
      ...Object.values(validationErrors)
        .filter(a => Array.isArray(a))
        .map(a => a.length)
    ) > 0;
  useEffect(() => {
    try {
      if (needReValidation) {
        validate(entryToEdit);
        setValidationErrors({});
      }
    } catch (e) {
      if (typeof e.groupedDetails === "object") {
        setValidationErrors(e.groupedDetails);
      }
    }
  }, [entryToEdit, needReValidation]);

  const syncRetry = () => {
    syncAll();
  };

  const escapeRegexCharacters = str =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const getProjectSuggestions = value => {
    const sortedItems = [...projectItems].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const escapedValue = escapeRegexCharacters(value.trim());

    if (escapedValue === "") {
      return sortedItems;
    }

    const regex = new RegExp("^" + escapedValue, "i");

    return sortedItems.filter(item => regex.test(item.name));
  };

  const getProjectSuggestionValue = suggestion => suggestion.name;

  const renderSuggestion = suggestion => <span>{suggestion.name}</span>;

  const [projectSuggestions, setProjectSuggestions] = useState([]);

  const onProjectSuggestionsFetchRequested = ({ value }) => {
    setProjectSuggestions(getProjectSuggestions(value));
  };

  const onProjectSuggestionsClearRequested = () => {
    setProjectSuggestions([]);
  };

  const shouldRenderSuggestions = value => true;

  const [projectAutosuggestId] = useState("autosuggest-" + uuidv4());

  const getTagsSuggestions = value => {
    const enteredTags = value.split(",").map(tag => tag.trim());
    const tagsExceptLast = enteredTags.slice(0, -1);
    const sortedItems = [...tagItems]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(({ name }) => !tagsExceptLast.includes(name));

    if (enteredTags.length === 0) {
      return sortedItems;
    }

    const escapedValue = escapeRegexCharacters(
      enteredTags[enteredTags.length - 1]
    );

    if (escapedValue === "") {
      return sortedItems;
    }

    const regex = new RegExp("^" + escapedValue, "i");

    return sortedItems.filter(item => regex.test(item.name));
  };

  const getTagsSuggestionValue = suggestion => {
    const enteredTags = (typeof entryToEdit.tags === "string"
      ? entryToEdit.tags
      : ""
    )
      .split(",")
      .map(tag => tag.trim())
      .slice(0, -1);
    enteredTags.push(suggestion.name);

    return enteredTags.join(", ");
  };

  const [tagsSuggestions, setTagsSuggestions] = useState([]);

  const onTagsSuggestionsFetchRequested = ({ value }) => {
    setTagsSuggestions(getTagsSuggestions(value));
  };

  const onTagsSuggestionsClearRequested = () => {
    setTagsSuggestions([]);
  };

  const [tagsAutosuggestId] = useState("autosuggest-" + uuidv4());

  if (isSyncing && pagedItems.length === 0) {
    return (
      <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle">
        <div>
          <Loader />
        </div>
      </div>
    );
  }

  if (logItems.length === 0) {
    return <GenerateDemo workspaceId={workspaceId} />;
  }

  return (
    <div className="uk-padding-small uk-flex uk-flex-center uk-flex-middle Log">
      <div className="uk-width-1-1">
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

        {pagedItems.map(
          ({
            uuid,
            userDisplayName,
            userImage,
            taskDescription,
            project,
            tags,
            startTimeString,
            endTimeString,
            hourlyRate,
            durationHours,
            sum,
            _synced,
            ...rest
          }) => (
            <div
              className="uk-card uk-card-default uk-card-small uk-margin uk-position-relative"
              key={uuid}
            >
              {!_synced && isSyncing ? <LoaderOverlay /> : null}
              <div className="uk-card-header">
                <div className="uk-grid-small" uk-grid="true">
                  <div className="uk-width-1-2 uk-width-2-3@l">
                    <div className="uk-grid-small" uk-grid="true">
                      <div>
                        {!_synced ? (
                          <span
                            className={!isSyncing ? "uk-text-warning" : ""}
                            uk-tooltip={`title: ${t("notSyncedWarning")};`}
                            uk-icon={isSyncing ? "refresh" : "warning"}
                          />
                        ) : (
                          <span
                            uk-tooltip={`title: ${t("syncedSign")};`}
                            uk-icon="database"
                          />
                        )}
                      </div>
                      <div className="uk-flex-1">{taskDescription}</div>
                    </div>
                  </div>
                  <div className="uk-width-1-2 uk-width-1-3@l">
                    <div
                      className="uk-grid-small uk-grid-divider"
                      uk-grid="true"
                    >
                      <div className="uk-flex-1 uk-text-right">
                        {typeof durationHours === "number"
                          ? Duration.fromObject({
                              hours: durationHours
                            }).toFormat("hh:mm:ss")
                          : null}
                        {typeof sum === "number"
                          ? " / $" + sum.toFixed(2)
                          : null}
                      </div>
                      <div>
                        <button
                          className={`uk-icon-link uk-margin-small-right ${
                            uuidToRemove === uuid || entryToEdit.uuid === uuid
                              ? "uk-disabled"
                              : ""
                          }`}
                          uk-icon="file-edit"
                          disabled={
                            uuidToRemove === uuid || entryToEdit.uuid === uuid
                          }
                          onClick={() =>
                            setEntryToEdit({
                              uuid,
                              userDisplayName,
                              userImage,
                              taskDescription,
                              project,
                              tags,
                              startTimeString,
                              endTimeString,
                              hourlyRate,
                              durationHours,
                              sum,
                              _synced,
                              ...rest
                            })
                          }
                        />
                        <button
                          className={`uk-icon-link ${
                            uuidToRemove === uuid || entryToEdit.uuid === uuid
                              ? "uk-disabled"
                              : ""
                          }`}
                          uk-icon="trash"
                          disabled={
                            uuidToRemove === uuid || entryToEdit.uuid === uuid
                          }
                          onClick={() => setUuidToRemove(uuid)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {(() => {
                if (entryToEdit.uuid === uuid) {
                  return (
                    <>
                      <div className="uk-card-body">
                        <form
                          className="uk-grid-small"
                          uk-grid=""
                          onSubmit={() => {}}
                        >
                          <div className="uk-width-1-1">
                            <label className="uk-form-label">
                              {t("editForm.taskDescription")}
                            </label>
                            <div className="uk-form-controls">
                              <input
                                className={`uk-input uk-form-small ${
                                  Array.isArray(
                                    validationErrors.taskDescription
                                  ) &&
                                  validationErrors.taskDescription.length > 0
                                    ? "uk-form-danger"
                                    : ""
                                }`}
                                type="text"
                                value={
                                  typeof entryToEdit.taskDescription ===
                                  "string"
                                    ? entryToEdit.taskDescription
                                    : ""
                                }
                                disabled={isSyncing}
                                onChange={({ target: { value } }) => {
                                  setEntryToEdit({
                                    ...entryToEdit,
                                    taskDescription: value
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="uk-width-1-3">
                            <label className="uk-form-label">
                              {t("editForm.project")}
                            </label>
                            <div className="uk-form-controls">
                              <Autosuggest
                                suggestions={projectSuggestions}
                                onSuggestionsFetchRequested={
                                  onProjectSuggestionsFetchRequested
                                }
                                onSuggestionsClearRequested={
                                  onProjectSuggestionsClearRequested
                                }
                                getSuggestionValue={getProjectSuggestionValue}
                                renderSuggestion={renderSuggestion}
                                shouldRenderSuggestions={
                                  shouldRenderSuggestions
                                }
                                inputProps={{
                                  disabled: isSyncing,
                                  value:
                                    typeof entryToEdit.project === "string"
                                      ? entryToEdit.project
                                      : "",
                                  onChange: (_, { newValue: value }) => {
                                    setEntryToEdit({
                                      ...entryToEdit,
                                      project: value
                                    });
                                  }
                                }}
                                theme={{
                                  ...theme,
                                  input:
                                    theme.input +
                                    " uk-form-small " +
                                    (Array.isArray(validationErrors.project) &&
                                    validationErrors.project.length > 0
                                      ? " uk-form-danger"
                                      : "")
                                }}
                                id={projectAutosuggestId}
                              />
                            </div>
                          </div>
                          <div className="uk-width-1-3">
                            <label className="uk-form-label">
                              {t("editForm.tags")}
                            </label>
                            <div className="uk-form-controls">
                              <Autosuggest
                                suggestions={tagsSuggestions}
                                onSuggestionsFetchRequested={
                                  onTagsSuggestionsFetchRequested
                                }
                                onSuggestionsClearRequested={
                                  onTagsSuggestionsClearRequested
                                }
                                getSuggestionValue={getTagsSuggestionValue}
                                renderSuggestion={renderSuggestion}
                                shouldRenderSuggestions={
                                  shouldRenderSuggestions
                                }
                                inputProps={{
                                  disabled: isSyncing,
                                  value:
                                    typeof entryToEdit.tags === "string"
                                      ? entryToEdit.tags
                                      : "",
                                  onChange: (_, { newValue: value }) => {
                                    setEntryToEdit({
                                      ...entryToEdit,
                                      tags: value
                                    });
                                  }
                                }}
                                theme={{
                                  ...theme,
                                  input:
                                    theme.input +
                                    " uk-form-small " +
                                    (Array.isArray(validationErrors.tags) &&
                                    validationErrors.tags.length > 0
                                      ? " uk-form-danger"
                                      : "")
                                }}
                                id={tagsAutosuggestId}
                              />
                            </div>
                          </div>
                          <div className="uk-width-1-3">
                            <label className="uk-form-label">
                              {t("editForm.hourlyRate")}
                            </label>
                            <div className="uk-form-controls">
                              <input
                                className={`uk-input uk-form-small ${
                                  Array.isArray(validationErrors.hourlyRate) &&
                                  validationErrors.hourlyRate.length > 0
                                    ? "uk-form-danger"
                                    : ""
                                }`}
                                type="text"
                                value={
                                  ["string", "number"].includes(
                                    typeof entryToEdit.hourlyRate
                                  )
                                    ? entryToEdit.hourlyRate
                                    : ""
                                }
                                disabled={isSyncing}
                                onChange={({ target: { value } }) => {
                                  setEntryToEdit({
                                    ...entryToEdit,
                                    hourlyRate: value
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="uk-width-1-2">
                            <label className="uk-form-label">
                              {t("editForm.startTimeString")}
                            </label>
                            <div className="uk-form-controls">
                              <input
                                className={`uk-input uk-form-small ${
                                  Array.isArray(
                                    validationErrors.startTimeString
                                  ) &&
                                  validationErrors.startTimeString.length > 0
                                    ? "uk-form-danger"
                                    : ""
                                }`}
                                type="text"
                                value={
                                  typeof entryToEdit.startTimeString ===
                                  "string"
                                    ? entryToEdit.startTimeString
                                    : ""
                                }
                                disabled={isSyncing}
                                onChange={({ target: { value } }) => {
                                  setEntryToEdit({
                                    ...entryToEdit,
                                    startTimeString: value
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="uk-width-1-2">
                            <label className="uk-form-label">
                              {t("editForm.endTimeString")}
                            </label>
                            <div className="uk-form-controls">
                              <input
                                className={`uk-input uk-form-small ${
                                  Array.isArray(
                                    validationErrors.endTimeString
                                  ) && validationErrors.endTimeString.length > 0
                                    ? "uk-form-danger"
                                    : ""
                                }`}
                                type="text"
                                value={
                                  typeof entryToEdit.endTimeString === "string"
                                    ? entryToEdit.endTimeString
                                    : ""
                                }
                                disabled={isSyncing}
                                onChange={({ target: { value } }) => {
                                  setEntryToEdit({
                                    ...entryToEdit,
                                    endTimeString: value
                                  });
                                }}
                              />
                            </div>
                          </div>

                          {Math.max(
                            ...Object.values(validationErrors).map(
                              ({ length }) => length
                            )
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
                                          label: t(`editForm.${context.label}`)
                                        })}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          ) : null}
                        </form>
                      </div>
                      <div className="uk-card-footer uk-text-right">
                        <button
                          className="uk-button uk-button-text"
                          type="button"
                          onClick={() => {
                            setEntryToEdit({});
                          }}
                        >
                          {t("cancelButton")}
                        </button>{" "}
                        <button
                          className="uk-button uk-button-link"
                          type="button"
                          onClick={() => {
                            let cleanData;
                            try {
                              setValidationErrors({});
                              cleanData = validate(entryToEdit);
                            } catch (e) {
                              setValidationErrors(e.groupedDetails);
                              return;
                            }

                            let tagsToAdd = [];
                            if (!isTagsSyncing) {
                              const existingTagNames = Object.values(
                                tagItems
                              ).map(({ name }) => name);
                              tagsToAdd = cleanData.tags
                                .split(",")
                                .map(tag => tag.trim())
                                .filter(tag => tag !== "")
                                .filter(tag => !existingTagNames.includes(tag))
                                .map(name => ({ name, uuid: uuidv4() }));
                            }
                            let projectToAdd;
                            if (!isProjectsSyncing) {
                              const existingProjectNames = Object.values(
                                projectItems
                              ).map(({ name }) => name);
                              if (
                                cleanData.project !== "" &&
                                !existingProjectNames.includes(
                                  cleanData.project
                                )
                              ) {
                                projectToAdd = {
                                  name: cleanData.project,
                                  uuid: uuidv4()
                                };
                              }
                            }

                            const durationHours = DateTime.fromISO(
                              cleanData.endTimeString
                            )
                              .diff(DateTime.fromISO(cleanData.startTimeString))
                              .as("hours");
                            saveItem(
                              {
                                ...entryToEdit,
                                ...cleanData,
                                durationHours,
                                sum:
                                  typeof durationHours === "number" &&
                                  typeof cleanData.hourlyRate === "number" &&
                                  durationHours > 0 &&
                                  cleanData.hourlyRate > 0
                                    ? durationHours * cleanData.hourlyRate
                                    : undefined
                              },
                              tagsToAdd,
                              projectToAdd
                            );
                            setEntryToEdit({});
                          }}
                        >
                          {t("saveButton")}
                        </button>
                      </div>
                    </>
                  );
                }

                if (uuidToRemove === uuid) {
                  return (
                    <>
                      <div className="uk-card-body">{t("removePrompt")}</div>
                      <div className="uk-card-footer uk-text-right">
                        <button
                          className="uk-button uk-button-text"
                          type="button"
                          onClick={() => {
                            setUuidToRemove(null);
                          }}
                        >
                          {t("cancelButton")}
                        </button>{" "}
                        <button
                          className="uk-button uk-button-link"
                          type="button"
                          onClick={() => {
                            deleteItem(uuidToRemove);
                            setUuidToRemove(null);
                          }}
                        >
                          {t("yesRemoveButton")}
                        </button>
                      </div>
                    </>
                  );
                }

                return (
                  <div className="uk-card-body uk-text-meta">
                    <div
                      className="uk-child-width-1-1 uk-child-width-1-2@m uk-grid-small"
                      uk-grid="true"
                    >
                      <div>
                        <div
                          className="uk-child-width-1-1 uk-grid-small"
                          uk-grid="true"
                        >
                          <div className="uk-grid-small" uk-grid="true">
                            <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                              {t("project")}:
                            </div>
                            <div className="uk-width-2-3">
                              {typeof project === "string" &&
                              project.trim().length > 0 ? (
                                project
                              ) : (
                                <>&mdash;</>
                              )}
                            </div>
                          </div>
                          <div className="uk-grid-small" uk-grid="true">
                            <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                              {t("tags")}:
                            </div>
                            <div className="uk-width-2-3">
                              {typeof tags === "string" &&
                              tags.trim().length > 0 ? (
                                <Tags
                                  workspaceId={workspaceId}
                                  tags={tags.split(",").map(tag => tag.trim())}
                                />
                              ) : (
                                <>&mdash;</>
                              )}
                            </div>
                          </div>
                          <div className="uk-grid-small" uk-grid="true">
                            <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                              {t("user")}:
                            </div>
                            <div className="uk-width-2-3">
                              <img
                                className="uk-border-circle user-image"
                                data-src={userImage || noImage}
                                width="16"
                                height="16"
                                alt=""
                                uk-img={userImage || noImage}
                              />{" "}
                              {userDisplayName}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div
                          className="uk-child-width-1-1 uk-grid-small"
                          uk-grid="true"
                        >
                          <div className="uk-grid-small" uk-grid="true">
                            <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                              {t("startedAt")}:
                            </div>
                            <div className="uk-width-2-3">
                              {DateTime.fromISO(startTimeString).toFormat(
                                "yyyy-MM-dd HH:mm:ss ZZZZ"
                              )}
                            </div>
                          </div>
                          <div className="uk-grid-small" uk-grid="true">
                            <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                              {t("finishedAt")}:
                            </div>
                            <div className="uk-width-2-3">
                              {DateTime.fromISO(endTimeString).toFormat(
                                "yyyy-MM-dd HH:mm:ss ZZZZ"
                              )}
                            </div>
                          </div>
                          <div className="uk-grid-small" uk-grid="true">
                            <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                              {t("hourlyRate")}:
                            </div>
                            <div className="uk-width-2-3">
                              {typeof hourlyRate === "number" ? (
                                "$" + hourlyRate.toFixed(2)
                              ) : (
                                <>&mdash;</>
                              )}
                            </div>
                          </div>
                          <div className="uk-grid-small" uk-grid="true">
                            <div className="uk-width-1-3 uk-text-uppercase uk-text-break">
                              {t("sum")}:
                            </div>
                            <div className="uk-width-2-3">
                              {typeof sum === "number" ? (
                                "$" + sum.toFixed(2)
                              ) : (
                                <>&mdash;</>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )
        )}

        <ul
          className="uk-pagination uk-flex-center uk-margin-medium-top"
          uk-margin="true"
        >
          {realCurrentPage > 1 ? (
            <li>
              <button
                type="button"
                className="button-link"
                onClick={() => {
                  setPage(realCurrentPage - 1);
                }}
              >
                <span uk-pagination-previous="true" /> {t("previousPage")}
              </button>
            </li>
          ) : null}
          {realCurrentPage > 2 ? (
            <>
              <li>
                <button
                  type="button"
                  className="button-link"
                  onClick={() => {
                    setPage(1);
                  }}
                >
                  1
                </button>
              </li>
              <li className="uk-disabled">
                <span>...</span>
              </li>
            </>
          ) : null}
          <li className="uk-active">
            <span>{realCurrentPage}</span>
          </li>
          {realCurrentPage < totalPages - 1 ? (
            <>
              <li className="uk-disabled">
                <span>...</span>
              </li>
              <li>
                <button
                  type="button"
                  className="button-link"
                  onClick={() => {
                    setPage(totalPages);
                  }}
                >
                  {totalPages}
                </button>
              </li>
            </>
          ) : null}
          {realCurrentPage < totalPages ? (
            <li>
              <button
                type="button"
                className="button-link"
                onClick={() => {
                  setPage(realCurrentPage + 1);
                }}
              >
                {t("nextPage")} <span uk-pagination-next="true" />
              </button>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
};

export { Log };

export default connect(
  (state, { workspaceId }) => ({
    isSyncing: isSyncing(state, workspaceId, "Log"),
    syncError: getError(state, workspaceId, "Log"),
    logItems: findMany(state, workspaceId, "Log").sort(
      (a, b) =>
        DateTime.fromJSDate(new Date(b.endTimeString)) -
        DateTime.fromJSDate(new Date(a.endTimeString))
    ),
    isTagsSyncing: isSyncing(state, workspaceId, "Tags"),
    tagItems: findMany(state, workspaceId, "Tags"),
    isProjectsSyncing: isSyncing(state, workspaceId, "Projects"),
    projectItems: findMany(state, workspaceId, "Projects")
  }),
  (dispatch, { workspaceId }) => ({
    syncAll: () => {
      dispatch(sync(workspaceId, ["Log", "Tags", "Projects"]));
    },
    deleteItem: uuid => {
      dispatch(deleteLocal(workspaceId, "Log", uuid));
      dispatch(sync(workspaceId, ["Log"]));
    },
    saveItem: (data, tags = [], project) => {
      dispatch(upsertLocal(workspaceId, "Log", data));
      tags.forEach(tag => dispatch(upsertLocal(workspaceId, "Tags", tag)));
      if (project) {
        dispatch(upsertLocal(workspaceId, "Projects", project));
      }
      dispatch(sync(workspaceId, ["Log", "Projects", "Tags"]));
    }
  })
)(Log);
