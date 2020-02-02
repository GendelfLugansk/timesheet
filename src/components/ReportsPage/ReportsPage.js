import AuthenticatedRoute from "../AuthenticatedRoute/AuthenticatedRoute";
import { Redirect, Switch } from "react-router-dom";
import React from "react";
import CalendarReportsPage from "./CalendarReportPage/CalendarReportPage";
import { connect } from "react-redux";
import Filters from "./Filters/Filters";
import { deserialize, serialize } from "../../utils/logFilters";
import uuidv4 from "uuid/v4";
import { sync, upsertLocal } from "../../actions/syncableStorage";
import SummaryReportPage from "./SummaryReportPage/SummaryReportPage";
import { useDebouncedCallback } from "use-debounce";
import { findMany, isSyncing } from "../../selectors/syncableStorage";
import WithWorkspace from "../WithWorkspace/WithWorkspace";

const ContentWithFilters = connect(
  (state, { workspaceId }) => ({
    isSyncing: isSyncing(state, workspaceId, "Config"),
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
    appliedFilters = [],
    filtersUUID,
    setAppliedFilters,
    syncFilters,
    workspaceId
  }) => {
    const [syncDebounced] = useDebouncedCallback(syncFilters, 1500);

    return (
      <div className="uk-width-1-1 uk-position-relative">
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

const ReportsPage = () => {
  return (
    <WithWorkspace>
      <ContentWithFilters />
    </WithWorkspace>
  );
};

export default ReportsPage;
