import AuthenticatedRoute from "../AuthenticatedRoute/AuthenticatedRoute";
import { Redirect, Switch } from "react-router-dom";
import React from "react";
import CalendarReportsPage from "./CalendarReportPage/CalendarReportPage";
import { connect } from "react-redux";
import Filters from "./Filters/Filters";
import { deserialize, serialize } from "../../utils/logFilters";
import uuidv4 from "uuid/v4";
import {
  sync,
  syncInWorkspace,
  upsertLocal
} from "../../actions/syncableStorage";
import SummaryReportPage from "./SummaryReportPage/SummaryReportPage";
import { useDebouncedCallback } from "use-debounce";
import { findMany, isSyncing } from "../../selectors/syncableStorage";
import WithWorkspace from "../WithWorkspace/WithWorkspace";
import { getCurrentWorkspaceId } from "../../selectors/workspaces";

const ContentWithFilters = connect(
  state => ({
    isSyncing: isSyncing(state, "Config"),
    appliedFilters: deserialize(
      (
        findMany(state, "Config").filter(
          ({ key, uuid }) => key === "filters"
        )[0] || {}
      ).value
    ),
    filtersUUID:
      (
        findMany(state, "Config").filter(
          ({ key, uuid }) => key === "filters"
        )[0] || {}
      ).uuid || uuidv4(),
    workspaceId: getCurrentWorkspaceId(state)
  }),
  null,
  ({ workspaceId, ...rest }, { dispatch }, ownProps) => ({
    ...ownProps,
    ...rest,
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
      dispatch(sync(["Config"]));
    }
  })
)(
  ({
    isSyncing,
    appliedFilters = [],
    filtersUUID,
    setAppliedFilters,
    syncFilters
  }) => {
    const [syncDebounced] = useDebouncedCallback(syncFilters, 1500);

    return (
      <div className="uk-width-1-1 uk-position-relative">
        <Filters
          isSyncing={isSyncing}
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
            <SummaryReportPage filters={appliedFilters} />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/reports/calendar">
            <CalendarReportsPage filters={appliedFilters} />
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
