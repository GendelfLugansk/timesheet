import {
  FETCH_WORKSPACE_DATA_BEGIN,
  FETCH_WORKSPACE_DATA_SUCCESS,
  FETCH_WORKSPACE_DATA_FAILURE,
  UPDATE_WORKSPACE_DATA_TIMER_IN_PROGRESS
} from "../actions/workspacesData";
import objectPath from "object-path";

const initialState = {};

const workspacesData = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_WORKSPACE_DATA_BEGIN: {
      const s = {};
      s[action.payload.workspaceId] = {
        isLoading: true,
        error: null
      };
      return {
        ...state,
        ...s
      };
    }

    case FETCH_WORKSPACE_DATA_SUCCESS: {
      const s = {};
      s[action.payload.workspaceId] = {
        isLoading: false,
        error: null,
        ...action.payload.workspaceData
      };
      return {
        ...state,
        ...s
      };
    }

    case FETCH_WORKSPACE_DATA_FAILURE: {
      const s = {};
      s[action.payload.workspaceId] = {
        isLoading: false,
        error: action.payload.error
      };
      return {
        ...state,
        ...s
      };
    }

    case UPDATE_WORKSPACE_DATA_TIMER_IN_PROGRESS: {
      const s = {};
      s[action.payload.workspaceId] = {
        ...objectPath.get(state, `${action.payload.workspaceId}`, {}),
        ...{
          timerInProgress: {
            ...objectPath.get(
              state,
              `${action.payload.workspaceId}.timerInProgress`,
              {}
            ),
            ...action.payload.timerInProgress
          }
        }
      };
      return {
        ...state,
        ...s
      };
    }

    default:
      return state;
  }
};

export default workspacesData;
