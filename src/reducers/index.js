import { combineReducers } from "redux";
import auth from "./auth";
import signIn from "./signIn";
import signOut from "./signOut";
import workspaces from "./workspaces";
import syncableStorage from "./syncableStorage";
import filters from "./filters";

export default combineReducers({
  auth,
  signIn,
  signOut,
  workspaces,
  syncableStorage,
  filters
});
