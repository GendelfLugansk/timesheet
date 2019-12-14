import {
  SYNCABLE_STORAGE_UPSERT_LOCAL,
  SYNCABLE_STORAGE_DELETE_LOCAL,
  SYNCABLE_STORAGE_REPLACE_ALL_LOCAL,
  SYNCABLE_STORAGE_SYNC_BEGIN,
  SYNCABLE_STORAGE_SYNC_SUCCESS,
  SYNCABLE_STORAGE_SYNC_FAILURE
} from "../actions/syncableStorage";
import { DateTime } from "luxon";

const supportedActions = [
  SYNCABLE_STORAGE_UPSERT_LOCAL,
  SYNCABLE_STORAGE_DELETE_LOCAL,
  SYNCABLE_STORAGE_REPLACE_ALL_LOCAL,
  SYNCABLE_STORAGE_SYNC_BEGIN,
  SYNCABLE_STORAGE_SYNC_SUCCESS,
  SYNCABLE_STORAGE_SYNC_FAILURE
];

const initialTableState = {
  isSyncing: false,
  error: null,
  data: []
};

const table = (state = initialTableState, action) => {
  switch (action.type) {
    case SYNCABLE_STORAGE_UPSERT_LOCAL: {
      let rowIndex;
      const data = [...state.data.map(row => ({ ...row }))];
      for (let i = 0; i < data.length; i++) {
        if (data[i] && data[i].uuid === action.payload.row.uuid) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex === undefined) {
        data.push({
          ...action.payload.row,
          _updatedAt: DateTime.utc().toISO(),
          _synced: action.payload.synced
        });
      } else {
        data[rowIndex] = {
          ...action.payload.row,
          _updatedAt: DateTime.utc().toISO(),
          _synced: action.payload.synced
        };
      }

      return {
        ...state,
        data
      };
    }

    case SYNCABLE_STORAGE_DELETE_LOCAL: {
      let rowIndex;
      const data = [...state.data.map(row => ({ ...row }))];
      for (let i = 0; i < data.length; i++) {
        if (data[i] && data[i].uuid === action.payload.uuid) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex === undefined) {
        return state;
      }

      data[rowIndex]._deleted = true;
      data[rowIndex]._updatedAt = DateTime.utc().toISO();
      data[rowIndex]._synced = action.payload.synced;

      return {
        ...state,
        data
      };
    }

    case SYNCABLE_STORAGE_REPLACE_ALL_LOCAL:
      return {
        ...state,
        data: action.payload.rows.map(row => ({
          ...row,
          _updatedAt: DateTime.utc().toISO(),
          _synced: action.payload.synced
        }))
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
