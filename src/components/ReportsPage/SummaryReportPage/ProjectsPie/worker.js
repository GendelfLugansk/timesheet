export function getRawData(logItems) {
  return Object.values(
    logItems
      .filter(({ durationHours }) => typeof durationHours === "number")
      .map(({ project, durationHours }) => ({
        project,
        durationHours
      }))
      .reduce((acc, { project, durationHours }) => {
        const mutAcc = { ...acc };
        if (mutAcc[project] === undefined) {
          mutAcc[project] = {
            project,
            durationHours: 0
          };
        }
        mutAcc[project].durationHours += durationHours;

        return mutAcc;
      }, {})
  ).sort((a, b) => b.durationHours - a.durationHours);
}
