import { DateTime } from "luxon";

export function getRawData(logItems, timeframe) {
  return Object.values(
    logItems
      .filter(({ durationHours }) => typeof durationHours === "number")
      .map(({ project, startTimeString, durationHours }) => ({
        project,
        date: DateTime.fromJSDate(new Date(startTimeString))
          .toLocal()
          .startOf(timeframe),
        durationHours
      }))
      .reduce((acc, { project, date, durationHours }) => {
        const mutAcc = { ...acc };
        const key = date.toISO();
        if (mutAcc[key] === undefined) {
          mutAcc[key] = {
            date: date.toJSDate(),
            durationHours: 0,
            projects: {}
          };
        }
        if (mutAcc[key].projects[project] === undefined) {
          mutAcc[key].projects[project] = {
            durationHours: 0
          };
        }
        mutAcc[key].durationHours += durationHours;
        mutAcc[key].projects[project].durationHours += durationHours;

        return mutAcc;
      }, {})
  )
    .sort((a, b) => a.date - b.date)
    .slice(-21);
}
