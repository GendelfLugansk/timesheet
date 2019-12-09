import { combineReducers } from "redux";
import auth from "./auth";
import signIn from "./signIn";
import signOut from "./signOut";
import workspaces from "./workspaces";
import workspacesData from "./workspacesData";

export default combineReducers({
  auth,
  signIn,
  signOut,
  workspaces,
  workspacesData
});
