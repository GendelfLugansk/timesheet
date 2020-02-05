import {
  FETCH_WORKSPACES_BEGIN,
  FETCH_WORKSPACES_SUCCESS,
  FETCH_WORKSPACES_FAILURE,
  SELECT_WORKSPACE
} from "../actions/workspaces";

const initialState = {
  isLoading: false,
  error: null,
  list: [],
  currentWorkspace: undefined
};

const workspaces = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_WORKSPACES_BEGIN:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case FETCH_WORKSPACES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        list: action.payload.workspaces
      };

    case FETCH_WORKSPACES_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error
      };

    case SELECT_WORKSPACE:
      return {
        ...state,
        currentWorkspace: action.payload.workspace
      };

    default:
      return state;
  }
};

export default workspaces;
