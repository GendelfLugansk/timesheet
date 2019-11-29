import React, { useEffect } from "react";
import { connect } from "react-redux";
import { fetchWorkspaces } from "../../actions/workspaces";
import LoaderFullPage from "../Loader/LoaderFullPage/LoaderFullPage";
import CreateFirstWorkspace from "./CreateFirstWorkspace/CreateFirstWorkspace";
import SelectWorkspace from "./SelectWorkspace/SelectWorkspace";

const HomePage = ({ isLoading, workspaces, currentWorkspace, fetchState }) => {
  useEffect(fetchState, []);

  if (isLoading) {
    return <LoaderFullPage />;
  }

  if (workspaces.length === 0) {
    return <CreateFirstWorkspace />;
  }

  if (!currentWorkspace) {
    return <SelectWorkspace />;
  }

  return null;
};

export { HomePage };

export default connect(
  state => ({
    isLoading: state.auth.isLoading || state.workspaces.isLoading,
    workspaces: state.workspaces.list,
    currentWorkspace: state.workspaces.currentWorkspace
  }),
  dispatch => ({
    fetchState: () => {
      (async () => {
        await dispatch(fetchWorkspaces());
      })();
    }
  })
)(HomePage);
