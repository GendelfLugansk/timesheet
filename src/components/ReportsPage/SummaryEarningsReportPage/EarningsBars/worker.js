import { DateTime } from "luxon";

export function getRawData(logItems, timeframe) {
  return Object.values(
    logItems
      .filter(({ sum }) => typeof sum === "number")
      .map(({ project, startTimeString, sum }) => ({
        project,
        date: DateTime.fromJSDate(new Date(startTimeString))
          .toLocal()
          .startOf(timeframe),
        sum
      }))
      .reduce((acc, { project, date, sum }) => {
        const mutAcc = { ...acc };
        const key = date.toISO();
        if (mutAcc[key] === undefined) {
          mutAcc[key] = {
            date: date.toJSDate(),
            sum: 0,
            projects: {}
          };
        }
        if (mutAcc[key].projects[project] === undefined) {
          mutAcc[key].projects[project] = {
            sum: 0
          };
        }
        mutAcc[key].sum += sum;
        mutAcc[key].projects[project].sum += sum;

        return mutAcc;
      }, {})
  )
    .sort((a, b) => a.date - b.date)
    .slice(-21);
}
