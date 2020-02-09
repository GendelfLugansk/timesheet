import React from "react";
import { shallowEqual, useSelector } from "react-redux";
import LoaderFullPage from "../Loader/LoaderFullPage/LoaderFullPage";
import CreateFirstWorkspace from "../CreateFirstWorkspace/CreateFirstWorkspace";
import SelectWorkspace from "../SelectWorkspace/SelectWorkspace";

const selector = state => ({
  isLoading: state.workspaces.isLoading,
  workspaces: state.workspaces.list,
  currentWorkspace: state.workspaces.currentWorkspace
});

const WithWorkspace = ({ children }) => {
  const { isLoading, workspaces, currentWorkspace } = useSelector(
    selector,
    shallowEqual
  );
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

export default WithWorkspace;
