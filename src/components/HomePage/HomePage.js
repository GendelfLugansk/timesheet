import React, { useEffect } from "react";
import { connect } from "react-redux";
import { fetchWorkspaces } from "../../actions/workspaces";
import LoaderFullPage from "../Loader/LoaderFullPage/LoaderFullPage";
import CreateFirstWorkspace from "../CreateFirstWorkspace/CreateFirstWorkspace";
import SelectWorkspace from "../SelectWorkspace/SelectWorkspace";
import Timer from "./Timer/Timer";
import stringifyError from "../../utils/stringifyError";
import Log from "./Log/Log";

const HomePage = ({
  isLoading,
  error,
  workspaces,
  currentWorkspace,
  fetchState
}) => {
  useEffect(fetchState, []);

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
    <>
      <Timer workspaceId={currentWorkspace.id} />
      <Log workspaceId={currentWorkspace.id} />
    </>
  );
};

export { HomePage };

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
)(HomePage);
