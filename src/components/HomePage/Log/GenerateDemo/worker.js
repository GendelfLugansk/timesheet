import { DateTime } from "luxon";
import uuidv4 from "uuid/v4";
import chartColors from "../../../../utils/chartColors";
import Color from "color";

/**
 * Returns random number
 *
 * @link https://snipplr.com/view/37687/random-number-float-generator
 * @param minValue Minimum, included
 * @param maxValue Maximum, included
 * @param precision
 * @returns {number}
 */
const getRandomFloat = (minValue, maxValue, precision = 2) =>
  parseFloat(
    Math.min(
      minValue + Math.random() * (maxValue - minValue),
      maxValue
    ).toFixed(precision)
  );

/**
 * Returns random integer
 *
 * @param min
 * @param max
 * @returns {*}
 */
const getRandomInteger = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Make array and fill with filler values
 *
 * @param length
 * @param filler
 * @returns {[]}
 */
const makeArray = (length, filler = 0) => {
  const ret = [];
  for (let i = 0; i < length; i++) {
    ret.push(filler);
  }
  return ret;
};

/**
 * Generates time log using a lot of random numbers and pool of project names
 *
 * @param userDisplayName
 * @param userId
 * @param userImage
 * @param years
 * @returns {{projects: {name: string, uuid: *, colorRGB: *}[], log: [], tags: {name: (string), uuid: *, colorRGB: *}[]}}
 */
export function generateDemoData(
  userDisplayName,
  userId,
  userImage,
  years = 5
) {
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

  const yesterday = DateTime.local().minus({ days: 1 });
  let date = yesterday.minus({ years });
  const log = [];
  while (date <= yesterday) {
    //Sunday is a weekend
    const weekends = [7];
    //In most cases saturday is a weekend too but sometimes (5% chance) you need to do extra work
    if (Math.random() < 0.95) {
      weekends.push(6);
    }
    if (!weekends.includes(date.weekday)) {
      //Start our day between 7:00 and 12:59
      let endTime = date.set({
        hour: getRandomInteger(7, 12),
        minute: getRandomInteger(0, 59)
      });
      //Usually we do 1 to 8 tasks in day but some days (10% chance) are full with small tasks (8 to 20)
      const tasksDone =
        Math.random() > 0.9 ? getRandomInteger(8, 20) : getRandomInteger(1, 8);
      //Most of days have 7.6 to 8.2 working hours but with 10% chance day will be exceptionally long (12 to 14)
      //or exceptionally short (4 to 6)
      const hoursToSpendDaily =
        Math.random() > 0.9
          ? Math.random() < 0.5
            ? getRandomFloat(4, 6)
            : getRandomFloat(12, 14)
          : getRandomFloat(7.6, 8.2);
      let hoursSpent = 0;
      for (let taskIndex = 1; taskIndex <= tasksDone; taskIndex++) {
        const hoursRemainder = hoursToSpendDaily - hoursSpent;
        if (hoursRemainder <= 0) {
          break;
        }
        //Randomly determine time spent on this task. This math has a flaw - first
        //tasks of the day will always tend to be shorter
        const taskHours =
          taskIndex === tasksDone
            ? hoursRemainder
            : getRandomFloat(0.1, hoursRemainder / (tasksDone - taskIndex + 1));
        hoursSpent += taskHours;
        //Tasks may have gaps between them, 0 to 15 minutes
        const startTime = endTime.plus({
          minutes: getRandomInteger(0, 15),
          milliseconds: 1
        });
        endTime = startTime.plus({ hours: taskHours });
        const hourlyRate = getRandomInteger(0, 100) || undefined;
        const task = {
          userDisplayName,
          taskDescription:
            descriptionsPool[getRandomInteger(0, descriptionsPool.length - 1)],
          project:
            projectNamesPool[getRandomInteger(0, projectNamesPool.length - 1)],
          tags: [
            ...new Set(
              makeArray(getRandomInteger(1, 3)).map(
                () => tagsPool[getRandomInteger(0, tagsPool.length - 1)]
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
