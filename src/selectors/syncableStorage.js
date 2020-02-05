import objectPath from "object-path";
import { getCurrentWorkspaceId } from "./workspaces";

const findManyInWorkspace = (
  state,
  workspaceId,
  table,
  includeDeleted = false
) =>
  Object.values(
    objectPath.get(state.syncableStorage, `${workspaceId}.${table}.data`, {})
  ).filter(({ _deleted }) => includeDeleted || !_deleted);

const findMany = (state, table, includeDeleted = false) =>
  findManyInWorkspace(
    state,
    getCurrentWorkspaceId(state),
    table,
    includeDeleted
  );

const isSyncing = (state, table) =>
  objectPath.get(
    state.syncableStorage,
    `${getCurrentWorkspaceId(state)}.${table}.isSyncing`,
    false
  );

const isAnySyncing = (state, tables) =>
  tables.reduce((acc, table) => acc || isSyncing(state, table), false);

const getError = (state, table) =>
  objectPath.get(
    state.syncableStorage,
    `${getCurrentWorkspaceId(state)}.${table}.error`,
    null
  );

const getFirstError = (state, tables) =>
  tables.reduce((acc, table) => acc || getError(state, table), null);

export {
  findManyInWorkspace,
  findMany,
  isSyncing,
  isAnySyncing,
  getError,
  getFirstError
};
