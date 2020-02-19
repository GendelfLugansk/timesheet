export function getRawData(logItems) {
  return Object.values(
    logItems
      .filter(({ sum }) => typeof sum === "number")
      .map(({ project, sum }) => ({
        project,
        sum
      }))
      .reduce((acc, { project, sum }) => {
        const mutAcc = { ...acc };
        if (mutAcc[project] === undefined) {
          mutAcc[project] = {
            project,
            sum: 0
          };
        }
        mutAcc[project].sum += sum;

        return mutAcc;
      }, {})
  ).sort((a, b) => b.sum - a.sum);
}
