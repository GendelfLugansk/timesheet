import AuthenticatedRoute from "../AuthenticatedRoute/AuthenticatedRoute";
import { Redirect, Switch } from "react-router-dom";
import React, { useEffect } from "react";
import CalendarReportsPage from "./CalendarReportPage/CalendarReportPage";
import { connect } from "react-redux";
import { fetchWorkspaces } from "../../actions/workspaces";
import LoaderFullPage from "../Loader/LoaderFullPage/LoaderFullPage";
import stringifyError from "../../utils/stringifyError";
import CreateFirstWorkspace from "../HomePage/CreateFirstWorkspace/CreateFirstWorkspace";
import SelectWorkspace from "../HomePage/SelectWorkspace/SelectWorkspace";
import Timer from "../HomePage/Timer/Timer";

const ReportsPage = ({
  isLoading,
  error,
  workspaces,
  currentWorkspace,
  fetchState
}) => {
  useEffect(() => {
    if (workspaces.length === 0) {
      fetchState();
    }
  }, [workspaces.length, fetchState]);

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

  return (
    <Switch>
      <AuthenticatedRoute exact path="/reports">
        <Redirect to="/reports/calendar" />
      </AuthenticatedRoute>
      <AuthenticatedRoute exact path="/reports/calendar">
        <CalendarReportsPage workspaceId={currentWorkspace.id} />
      </AuthenticatedRoute>
    </Switch>
  );
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
