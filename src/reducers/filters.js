import { SET_FILTERS } from "../actions/filters";

const workspaces = (state = "", action) => {
  switch (action.type) {
    case SET_FILTERS:
      return action.payload.filters;

    default:
      return state;
  }
};

export default workspaces;
