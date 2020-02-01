import objectPath from "object-path";

const findMany = (state, workspaceId, table, includeDeleted = false) =>
  Object.values(
    objectPath.get(state.syncableStorage, `${workspaceId}.${table}.data`, {})
  ).filter(({ _deleted }) => includeDeleted || !_deleted);

const isSyncing = (state, workspaceId, table) =>
  objectPath.get(
    state.syncableStorage,
    `${workspaceId}.${table}.isSyncing`,
    false
  );

const isAnySyncing = (state, workspaceId, tables) =>
  tables.reduce(
    (acc, table) => acc || isSyncing(state, workspaceId, table),
    false
  );

const getError = (state, workspaceId, table) =>
  objectPath.get(state.syncableStorage, `${workspaceId}.${table}.error`, null);

const getFirstError = (state, workspaceId, tables) =>
  tables.reduce(
    (acc, table) => acc || getError(state, workspaceId, table),
    null
  );

export { findMany, isSyncing, isAnySyncing, getError, getFirstError };
