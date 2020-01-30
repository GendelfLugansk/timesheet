import objectPath from "object-path";

const findMany = (state, workspaceId, table) =>
  Object.values(
    objectPath.get(state.syncableStorage, `${workspaceId}.${table}.data`, {})
  ).filter(({ _deleted }) => !_deleted);

const isSyncing = (state, workspaceId, table) =>
  objectPath.get(
    state.syncableStorage,
    `${workspaceId}.${table}.isSyncing`,
    false
  );

const getError = (state, workspaceId, table) =>
  objectPath.get(state.syncableStorage, `${workspaceId}.${table}.error`, null);

export { findMany, isSyncing, getError };
