import { DateTime } from "luxon";
import uuidv4 from "uuid/v4";
import chartColors from "../../../../utils/chartColors";
import Color from "color";

export function generateDemoData(userDisplayName, userId, userImage) {
  const projectNamesPool = [
    "Webster Green Moth",
    "Bush Teal Ladybug",
    "Yellow Caterpillar",
    "Farmington White Cockroach",
    "Laurelton Green Tinamou",
    "Black Coypu",
    "Olive Vicuna",
    "Black Froghopper",
    "Lime Zeren",
    "White Rat",
    "Olive Deer",
    "Fuschia Python",
    "Green Viper",
    "Lime Cobra",
    "Blue Rat Snake",
    "Gray Goose",
    "Black Heron",
    "Navy Buzzard",
    "Yellow Hen",
    "Lime ﻿Albatross"
  ];
  const tagsPool = ["UI", "API", "DB", "DevOps", "Research"];
  const descriptionsPool = [
    "Fix nasty bug",
    "Develop new shining feature",
    "Write documentation",
    "Investigate random crashes",
    "Participate in a meeting"
  ];
  const getRndInteger = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const makeArray = (length, filler = 0) => {
    const ret = [];
    for (let i = 0; i < length; i++) {
      ret.push(filler);
    }
    return ret;
  };
  const yesterday = DateTime.local().minus({ days: 1 });
  let date = yesterday.minus({ years: 10 });
  const log = [];
  while (date <= yesterday) {
    const weekends = [7];
    if (Math.random() < 0.95) {
      weekends.push(6);
    }
    if (!weekends.includes(date.weekday)) {
      let endTime = date.set({
        hour: getRndInteger(7, 12),
        minute: getRndInteger(0, 59)
      });
      const tasksDone = getRndInteger(1, 5);
      const hoursToSpendDaily =
        Math.random() > 0.9
          ? Math.random() < 0.5
            ? getRndInteger(4, 6)
            : getRndInteger(12, 14)
          : 8 + getRndInteger(0, 5) / 10 - getRndInteger(0, 2) / 10;
      let hoursSpent = 0;
      for (let taskIndex = 1; taskIndex <= tasksDone; taskIndex++) {
        const hoursRemainder = hoursToSpendDaily - hoursSpent;
        if (hoursRemainder <= 0) {
          break;
        }
        const taskHours =
          taskIndex === tasksDone
            ? hoursRemainder
            : getRndInteger(
                0,
                Math.floor(hoursRemainder / (tasksDone - taskIndex + 1))
              ) + Number(Math.random().toFixed(2));
        hoursSpent += taskHours;
        const startTime = endTime.plus({
          minutes: getRndInteger(0, 15),
          milliseconds: 1
        });
        endTime = startTime.plus({ hours: taskHours });
        const hourlyRate = getRndInteger(0, 100) || undefined;
        const task = {
          userDisplayName,
          taskDescription:
            descriptionsPool[getRndInteger(0, descriptionsPool.length - 1)],
          project:
            projectNamesPool[getRndInteger(0, projectNamesPool.length - 1)],
          tags: [
            ...new Set(
              makeArray(getRndInteger(1, 3)).map(
                () => tagsPool[getRndInteger(0, tagsPool.length - 1)]
              )
            )
          ].join(", "),
          startTimeString: startTime.toISO(),
          endTimeString: endTime.toISO(),
          hourlyRate,
          durationHours: taskHours,
          sum: hourlyRate !== undefined ? hourlyRate * taskHours : undefined,
          userId,
          uuid: uuidv4(),
          updatedAt: DateTime.local().toISO(),
          userImage
        };
        log.push(task);
      }
    }
    date = date.plus({ days: 1 });
  }

  return {
    log,
    projects: projectNamesPool.map(name => ({
      name,
      colorRGB: Color(chartColors.getColor("_generated_projects", name))
        .desaturate(0.3)
        .rgb()
        .string(),
      uuid: uuidv4()
    })),
    tags: tagsPool.map(name => ({
      name,
      colorRGB: Color(chartColors.getColor("_generated_tags", name))
        .desaturate(0.3)
        .rgb()
        .string(),
      uuid: uuidv4()
    }))
  };
}
