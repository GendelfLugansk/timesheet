import { DateTime } from "luxon";
import pako from "pako";
import base64Decode from "./base64Decode";
import base64Encode from "./base64Encode";

const coerceDataValue = (value, typeToCoerce) => {
  switch (typeToCoerce) {
    case "String":
      return String(value);

    case "Number":
      return Number(value);

    case "DateTime":
      return typeof value === "string"
        ? DateTime.fromJSDate(new Date(value))
        : value;

    case "ArrayOfStrings":
      return typeof value === "string"
        ? value
            .split(",")
            .map(v => v.trim())
            .filter(v => v.length > 0)
        : value;

    default:
      return value;
  }
};

const coerceFilterValue = (value, typeToCoerce) => {
  switch (typeToCoerce) {
    case "String":
    case "ArrayOfStrings":
      return String(value);

    case "Number":
      return Number(value);

    case "DateTime":
      return typeof value === "string"
        ? DateTime.fromJSDate(new Date(value))
        : value;

    default:
      return value;
  }
};

const checkFilter = (logItem, { key, type, values, typeToCoerce } = {}) => {
  const coercedFilterValues = values.map(v =>
    coerceFilterValue(v, typeToCoerce)
  );
  const coercedValue = coerceDataValue(logItem[key], typeToCoerce);

  switch (type) {
    case "includes": {
      if (Array.isArray(coercedValue)) {
        for (const v of coercedValue) {
          if (coercedFilterValues.includes(v)) {
            return true;
          }
        }

        return false;
      } else {
        return coercedFilterValues.includes(coercedValue);
      }
    }

    case "between": {
      if (
        coercedFilterValues[0] !== undefined &&
        coercedValue < coercedFilterValues[0]
      ) {
        return false;
      }
      if (
        coercedFilterValues[1] !== undefined &&
        coercedValue > coercedFilterValues[1]
      ) {
        return false;
      }
      return true;
    }

    default:
      return true;
  }
};

const filterFunction = filters => logItem => {
  for (const filter of filters) {
    if (!checkFilter(logItem, filter)) {
      return false;
    }
  }

  return true;
};

const applyFilters = (logItems = [], filters = []) => {
  return logItems.filter(filterFunction(filters));
};

const getProjectsFilter = (logItems = []) => {
  return {
    key: "project",
    type: "includes",
    availableValues: [
      ...new Set(logItems.map(({ project }) => String(project)))
    ].sort(),
    typeToCoerce: "String"
  };
};
const getTagsFilter = (logItems = []) => {
  return {
    key: "tags",
    type: "includes",
    availableValues: [
      ...new Set(
        [].concat(
          ...logItems.map(({ tags }) =>
            String(tags)
              .split(",")
              .map(v => v.trim())
              .filter(v => v.length > 0)
          )
        )
      )
    ].sort(),
    typeToCoerce: "ArrayOfStrings"
  };
};

const getEndTimeStringFilter = (logItems = []) => {
  const times = logItems.map(({ endTimeString }) =>
    DateTime.fromJSDate(new Date(endTimeString))
  );
  return {
    key: "endTimeString",
    type: "between",
    availableValues:
      times.length > 0
        ? [
            Math.min(DateTime.fromISO("1970-01-01T00:00:00+00:00"), ...times),
            Math.max(DateTime.fromISO("2970-01-01T00:00:00+00:00"), ...times)
          ].map(v => DateTime.fromJSDate(new Date(v)))
        : [],
    typeToCoerce: "DateTime"
  };
};

const getStartTimeStringFilter = (logItems = []) => {
  const times = logItems.map(({ startTimeString }) =>
    DateTime.fromJSDate(new Date(startTimeString))
  );
  return {
    key: "startTimeString",
    type: "between",
    availableValues:
      times.length > 0
        ? [
            Math.min(DateTime.fromISO("1970-01-01T00:00:00+00:00"), ...times),
            Math.max(DateTime.fromISO("2970-01-01T00:00:00+00:00"), ...times)
          ].map(v => DateTime.fromJSDate(new Date(v)))
        : [],
    typeToCoerce: "DateTime"
  };
};

const getAvailableFilters = (logItems = []) => {
  return [
    getProjectsFilter(logItems),
    getTagsFilter(logItems),
    getStartTimeStringFilter(logItems),
    getEndTimeStringFilter(logItems)
  ].filter(({ availableValues }) => availableValues.length > 0);
};

const serialize = filters => {
  if (!Array.isArray(filters)) {
    return undefined;
  }

  return base64Encode(pako.deflate(JSON.stringify(filters), { to: "string" }));
};

const deserialize = filtersStr => {
  if (!filtersStr) {
    return [];
  }

  try {
    return JSON.parse(
      pako.inflate(base64Decode(filtersStr), { to: "string" })
    ).map(({ values = [], ...rest }) => ({
      ...rest,
      values: values.map(v => (v === null ? undefined : v))
    }));
  } catch (e) {
    console.warning("Failed to deserialize filters", filtersStr, e);
    return [];
  }
};

export {
  filterFunction,
  applyFilters,
  getAvailableFilters,
  serialize,
  deserialize
};
