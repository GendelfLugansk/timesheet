import { shallowEqual, useSelector } from "react-redux";
import { deserialize, filterFunction } from "../utils/logFilters";
import {
  serializedFiltersSelector,
  isFiltersSyncingSelector
} from "../selectors/filters";
import { isLogSyncingSelector, logSelector } from "../selectors/log";

const selector = state => {
  const filters = deserialize(serializedFiltersSelector(state));
  const unfilteredLog = logSelector(state);
  const filteredLog = unfilteredLog.filter(filterFunction(filters));
  return filteredLog;
};

const isSyncingSelector = state =>
  isFiltersSyncingSelector(state) || isLogSyncingSelector(state);

const useFilteredLog = () => {
  const logItems = useSelector(selector, shallowEqual);
  const isSyncing = useSelector(isSyncingSelector);
  return { logItems, isSyncing };
};

export default useFilteredLog;
