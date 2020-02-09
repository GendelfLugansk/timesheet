import { findMany, isSyncing } from "./syncableStorage";

const logSelector = state => findMany(state, "Log");

const isLogSyncingSelector = state => isSyncing(state, "Log");

export { logSelector, isLogSyncingSelector };
