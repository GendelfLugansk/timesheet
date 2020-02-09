import { findMany } from "./syncableStorage";

const tagsSelector = state => findMany(state, "Tags");

export { tagsSelector };
