export function getRawData(logItems) {
  return Object.values(
    logItems
      .filter(({ sum }) => typeof sum === "number")
      .map(({ tags, sum }) => ({
        tags:
          typeof tags === "string" && tags.length > 0
            ? tags
                .split(",")
                .map(v => v.trim())
                .filter(v => v.length > 0)
                .sort()
                .join("+")
            : "",
        sum
      }))
      .reduce((acc, { tags, sum }) => {
        const mutAcc = { ...acc };
        if (mutAcc[tags] === undefined) {
          mutAcc[tags] = {
            tags,
            sum: 0
          };
        }
        mutAcc[tags].sum += sum;

        return mutAcc;
      }, {})
  ).sort((a, b) => b.sum - a.sum);
}
