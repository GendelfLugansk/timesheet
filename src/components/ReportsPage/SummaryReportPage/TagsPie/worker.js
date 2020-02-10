export function getRawData(logItems) {
  return Object.values(
    logItems
      .filter(({ durationHours }) => typeof durationHours === "number")
      .map(({ tags, durationHours }) => ({
        tags:
          typeof tags === "string" && tags.length > 0
            ? tags
                .split(",")
                .map(v => v.trim())
                .filter(v => v.length > 0)
                .sort()
                .join("+")
            : "",
        durationHours
      }))
      .reduce((acc, { tags, durationHours }) => {
        const mutAcc = { ...acc };
        if (mutAcc[tags] === undefined) {
          mutAcc[tags] = {
            tags,
            durationHours: 0
          };
        }
        mutAcc[tags].durationHours += durationHours;

        return mutAcc;
      }, {})
  ).sort((a, b) => b.durationHours - a.durationHours);
}
