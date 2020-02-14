import { useMemo } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { deserialize, filterFunction } from "../utils/logFilters";
import { isLogSyncingSelector, logSelector } from "../selectors/log";
import { filtersSelector } from "../selectors/filters";

const useFilteredLog = () => {
  const filters = useSelector(filtersSelector);
  const unfilteredItems = useSelector(logSelector, shallowEqual);
  const logItems = useMemo(
    () => unfilteredItems.filter(filterFunction(deserialize(filters))),
    [unfilteredItems, filters]
  );
  const isSyncing = useSelector(isLogSyncingSelector);
  return { logItems, isSyncing };
};

export default useFilteredLog;
