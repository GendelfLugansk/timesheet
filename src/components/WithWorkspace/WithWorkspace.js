import React from "react";
import { connect } from "react-redux";
import LoaderFullPage from "../Loader/LoaderFullPage/LoaderFullPage";
import CreateFirstWorkspace from "../CreateFirstWorkspace/CreateFirstWorkspace";
import SelectWorkspace from "../SelectWorkspace/SelectWorkspace";

const WithWorkspace = ({
  isLoading,
  workspaces,
  currentWorkspace,
  children
}) => {
  if (isLoading) {
    return <LoaderFullPage />;
  }

  if (workspaces.length === 0) {
    return <CreateFirstWorkspace />;
  }

  if (!currentWorkspace) {
    return <SelectWorkspace />;
  }

  return <>{children}</>;
};

export { WithWorkspace };

export default connect(state => ({
  isLoading: state.workspaces.isLoading,
  workspaces: state.workspaces.list,
  currentWorkspace: state.workspaces.currentWorkspace
}))(WithWorkspace);
