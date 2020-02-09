import { findMany } from "./syncableStorage";

const projectsSelector = state => findMany(state, "Projects");

export { projectsSelector };
