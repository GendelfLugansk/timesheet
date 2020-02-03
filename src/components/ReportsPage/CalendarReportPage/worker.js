import { DateTime } from "luxon";

export function generateCalendarData(logItems, fullDayHours, language) {
  const localizedMonths = [];
  return Object.values(
    logItems.reduce((acc, item) => {
      const startTime = DateTime.fromJSDate(
        new Date(item.startTimeString)
      ).toLocal();
      const monthStr = startTime.year + "-" + startTime.month;
      const startOfMonth = startTime.startOf("month");
      if (acc[monthStr] === undefined) {
        const monthNumber = startTime.month;
        if (localizedMonths[monthNumber] === undefined) {
          localizedMonths[monthNumber] = startTime
            .setLocale(language)
            .toFormat("LLLL");
        }
        const monthName = localizedMonths[monthNumber] + ", " + startTime.year;
        //Map ignores empty values if array created as Array(7)
        const typicalWeek = [
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        ];
        acc[monthStr] = {
          key: monthStr,
          name: monthName,
          year: startTime.year,
          startOfMonth: Number(startOfMonth),
          weeks: [
            [...typicalWeek],
            [...typicalWeek],
            [...typicalWeek],
            [...typicalWeek],
            [...typicalWeek],
            [...typicalWeek]
          ]
        };
        //Fill month with weeks
        for (
          let date = startOfMonth;
          date <= startTime.endOf("month").endOf("day");
          date = date.plus({ days: 1 })
        ) {
          const weekIndex =
            Math.ceil((date.day + startOfMonth.weekday - 1) / 7) - 1;
          const weekdayIndex = date.weekday - 1;
          if (acc[monthStr].weeks[weekIndex][weekdayIndex] === undefined) {
            acc[monthStr].weeks[weekIndex][weekdayIndex] = {
              items: [],
              durationHours: 0,
              sum: 0,
              dailyPercentage: 0,
              day: date.day
            };
          }
        }
      }
      const weekIndex =
        Math.ceil((startTime.day + startOfMonth.weekday - 1) / 7) - 1;
      const weekdayIndex = startTime.weekday - 1;
      acc[monthStr].weeks[weekIndex][weekdayIndex].items.push(item);
      acc[monthStr].weeks[weekIndex][weekdayIndex].durationHours +=
        typeof item.durationHours === "number" ? item.durationHours : 0;
      acc[monthStr].weeks[weekIndex][weekdayIndex].sum +=
        typeof item.sum === "number" ? item.sum : 0;
      acc[monthStr].weeks[weekIndex][weekdayIndex].dailyPercentage =
        (acc[monthStr].weeks[weekIndex][weekdayIndex].durationHours * 100) /
        fullDayHours;

      return acc;
    }, {})
  );
}
