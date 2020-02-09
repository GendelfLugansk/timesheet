import objectPath from "object-path";

const getCurrentWorkspace = state =>
  objectPath.get(state, "workspaces.currentWorkspace", {});

const workspaceIdSelector = state => getCurrentWorkspace(state).id;

export { workspaceIdSelector };
