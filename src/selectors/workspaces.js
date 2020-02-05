import objectPath from "object-path";

const getCurrentWorkspace = state =>
  objectPath.get(state, "workspaces.currentWorkspace", {});

const getCurrentWorkspaceId = state => getCurrentWorkspace(state).id;

export { getCurrentWorkspaceId };
