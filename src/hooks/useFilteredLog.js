import { shallowEqual, useSelector } from "react-redux";
import { filterFunction } from "../utils/logFilters";
import { filtersSelector } from "../selectors/filters";
import { logSelector } from "../selectors/log";

const selector = state => {
  const filters = filtersSelector(state);
  const unfilteredLog = logSelector(state);
  return unfilteredLog.filter(filterFunction(filters));
};

const useFilteredLog = () => {
  return useSelector(selector, shallowEqual);
};

export default useFilteredLog;
