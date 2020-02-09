import { deserialize } from "../utils/logFilters";
import { findMany, isSyncing } from "./syncableStorage";

const filtersRowSelector = state =>
  findMany(state, "Config").filter(({ key, uuid }) => key === "filters")[0] ||
  {};

const filtersSelector = state => deserialize(filtersRowSelector(state).value);

const filtersRowUUIDSelector = state => filtersRowSelector(state).uuid;

const isFiltersSyncingSelector = state => isSyncing(state, "Config");

export { filtersSelector, filtersRowUUIDSelector, isFiltersSyncingSelector };
