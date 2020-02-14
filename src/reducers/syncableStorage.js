import {
  SYNCABLE_STORAGE_CLEAR_LOCAL_WORKSPACE,
  SYNCABLE_STORAGE_DELETE_LOCAL,
  SYNCABLE_STORAGE_REPLACE_ALL_LOCAL,
  SYNCABLE_STORAGE_SYNC_BEGIN,
  SYNCABLE_STORAGE_SYNC_FAILURE,
  SYNCABLE_STORAGE_SYNC_SUCCESS,
  SYNCABLE_STORAGE_UPSERT_LOCAL
} from "../actions/syncableStorage";
import { DateTime } from "luxon";

const supportedActions = [
  SYNCABLE_STORAGE_UPSERT_LOCAL,
  SYNCABLE_STORAGE_DELETE_LOCAL,
  SYNCABLE_STORAGE_REPLACE_ALL_LOCAL,
  SYNCABLE_STORAGE_CLEAR_LOCAL_WORKSPACE,
  SYNCABLE_STORAGE_SYNC_BEGIN,
  SYNCABLE_STORAGE_SYNC_SUCCESS,
  SYNCABLE_STORAGE_SYNC_FAILURE
];

const initialTableState = {
  isSyncing: false,
  error: null,
  data: {}
};

const table = (state = initialTableState, action) => {
  switch (action.type) {
    case SYNCABLE_STORAGE_UPSERT_LOCAL: {
      const data = { ...state.data };
      data[action.payload.row.uuid] = {
        ...action.payload.row,
        _updatedAt: DateTime.utc().toISO(),
        _synced: action.payload.synced
      };

      return {
        ...state,
        data
      };
    }

    case SYNCABLE_STORAGE_DELETE_LOCAL: {
      const data = { ...state.data };
      if (typeof data[action.payload.uuid] === "object") {
        data[action.payload.uuid] = { ...data[action.payload.uuid] };
        data[action.payload.uuid]._deleted = true;
        data[action.payload.uuid]._updatedAt = DateTime.utc().toISO();
        data[action.payload.uuid]._synced = action.payload.synced;
      }

      return {
        ...state,
        data
      };
    }

    case SYNCABLE_STORAGE_REPLACE_ALL_LOCAL:
      return {
        ...state,
        data: action.payload.rows.reduce((acc, row) => {
          acc[row.uuid] = {
            ...row,
            _updatedAt: DateTime.utc().toISO(),
            _synced: action.payload.synced
          };

          return acc;
        }, {})
      };

    case SYNCABLE_STORAGE_SYNC_BEGIN:
      return {
        ...state,
        isSyncing: true,
        error: null
      };

    case SYNCABLE_STORAGE_SYNC_SUCCESS:
      return {
        ...state,
        isSyncing: false,
        error: null
      };

    case SYNCABLE_STORAGE_SYNC_FAILURE:
      return {
        ...state,
        isSyncing: false,
        error: action.payload.error
      };

    default:
      return state;
  }
};

const initialWorkspaceState = {};

const workspace = (state = initialWorkspaceState, action) => {
  if (action.type === SYNCABLE_STORAGE_CLEAR_LOCAL_WORKSPACE) {
    return { ...initialWorkspaceState };
  }

  if (supportedActions.includes(action.type)) {
    const s = {};
    s[action.payload.table] = table(state[action.payload.table], action);
    return {
      ...state,
      ...s
    };
  }

  return state;
};

const initialState = {};

const syncableStorage = (state = initialState, action) => {
  if (supportedActions.includes(action.type)) {
    const s = {};
    s[action.payload.workspaceId] = workspace(
      state[action.payload.workspaceId],
      action
    );

    return {
      ...state,
      ...s
    };
  }

  return state;
};

export default syncableStorage;
