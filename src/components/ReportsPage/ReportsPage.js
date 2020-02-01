import AuthenticatedRoute from "../AuthenticatedRoute/AuthenticatedRoute";
import { Redirect, Switch } from "react-router-dom";
import React, { useEffect } from "react";
import CalendarReportsPage from "./CalendarReportPage/CalendarReportPage";
import { connect } from "react-redux";
import { fetchWorkspaces } from "../../actions/workspaces";
import LoaderFullPage from "../Loader/LoaderFullPage/LoaderFullPage";
import stringifyError from "../../utils/stringifyError";
import CreateFirstWorkspace from "../CreateFirstWorkspace/CreateFirstWorkspace";
import SelectWorkspace from "../SelectWorkspace/SelectWorkspace";
import Filters from "./Filters/Filters";
import { deserialize, serialize } from "../../utils/logFilters";
import uuidv4 from "uuid/v4";
import { sync, upsertLocal } from "../../actions/syncableStorage";
import { useTranslation } from "react-i18next";
import i18n from "../../utils/i18n";
import en from "./ReportsPage.en";
import ru from "./ReportsPage.ru";
import SummaryReportPage from "./SummaryReportPage/SummaryReportPage";
import { useDebouncedCallback } from "use-debounce";
import { findMany, getError, isSyncing } from "../../selectors/syncableStorage";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const WithFilters = connect(
  (state, { workspaceId }) => ({
    isSyncing: isSyncing(state, workspaceId, "Config"),
    syncError: getError(state, workspaceId, "Config"),
    appliedFilters: deserialize(
      (
        findMany(state, workspaceId, "Config").filter(
          ({ key, uuid }) => key === "filters"
        )[0] || {}
      ).value
    ),
    filtersUUID:
      (
        findMany(state, workspaceId, "Config").filter(
          ({ key, uuid }) => key === "filters"
        )[0] || {}
      ).uuid || uuidv4()
  }),
  (dispatch, { workspaceId }) => ({
    fetchState: () => {
      dispatch(sync(workspaceId, ["Config"]));
    },
    setAppliedFilters: (filters, uuid) => {
      dispatch(
        upsertLocal(workspaceId, "Config", {
          key: "filters",
          value: serialize(filters),
          uuid
        })
      );
    },
    syncFilters: () => {
      dispatch(sync(workspaceId, ["Config"]));
    }
  })
)(
  ({
    isSyncing,
    syncError,
    appliedFilters = [],
    filtersUUID,
    setAppliedFilters,
    syncFilters,
    fetchState,
    workspaceId
  }) => {
    const { t } = useTranslation(ns);

    const [syncDebounced] = useDebouncedCallback(syncFilters, 1500);

    const syncRetry = () => {
      fetchState();
    };

    return (
      <div className="uk-width-1-1 uk-position-relative">
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

        <Filters
          isSyncing={isSyncing}
          workspaceId={workspaceId}
          appliedFilters={appliedFilters}
          setAppliedFilters={filters => {
            setAppliedFilters(filters, filtersUUID);
            syncDebounced();
          }}
        />
        <Switch>
          <AuthenticatedRoute exact path="/reports">
            <Redirect to="/reports/summary" />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/reports/summary">
            <SummaryReportPage
              workspaceId={workspaceId}
              filters={appliedFilters}
            />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/reports/calendar">
            <CalendarReportsPage
              workspaceId={workspaceId}
              filters={appliedFilters}
            />
          </AuthenticatedRoute>
        </Switch>
      </div>
    );
  }
);

const ReportsPage = ({
  isLoading,
  error,
  workspaces,
  currentWorkspace,
  fetchState
}) => {
  if (isLoading) {
    return <LoaderFullPage />;
  }

  if (error) {
    return (
      <div className="uk-flex uk-flex-center uk-flex-middle min-height-100">
        <div className="uk-width-1-1 uk-width-2-3@m uk-width-1-2@l">
          <div className="uk-alert-danger" uk-alert="true">
            {stringifyError(error)}
          </div>
        </div>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return <CreateFirstWorkspace />;
  }

  if (!currentWorkspace) {
    return <SelectWorkspace />;
  }

  return <WithFilters workspaceId={currentWorkspace.id} />;
};

export { ReportsPage };

export default connect(
  state => ({
    isLoading: state.workspaces.isLoading,
    error: state.workspaces.error,
    workspaces: state.workspaces.list,
    currentWorkspace: state.workspaces.currentWorkspace
  }),
  dispatch => ({
    fetchState: () => {
      dispatch(fetchWorkspaces());
    }
  })
)(ReportsPage);
