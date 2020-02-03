import objectPath from "object-path";
import loadGAPI from "../utils/googleapi";
import { DateTime } from "luxon";
import { findMany } from "../selectors/syncableStorage";

export const TYPE_STRING = "String";
export const TYPE_NUMBER = "Number";
export const TYPE_ARRAY_OF_STRINGS = "ArrayOfStrings";
export const TYPE_ISO_DATE = "ISODate";

const tablesConfig = {
  Log: {
    userDisplayName: {
      index: 0,
      alpha: "A",
      type: TYPE_STRING
    },
    taskDescription: {
      index: 1,
      alpha: "B",
      type: TYPE_STRING
    },
    project: {
      index: 2,
      alpha: "C",
      type: TYPE_STRING
    },
    tags: {
      index: 3,
      alpha: "D",
      type: TYPE_ARRAY_OF_STRINGS
    },
    startTimeString: {
      index: 4,
      alpha: "E",
      type: TYPE_ISO_DATE
    },
    endTimeString: {
      index: 5,
      alpha: "F",
      type: TYPE_ISO_DATE
    },
    hourlyRate: {
      index: 6,
      alpha: "G",
      type: TYPE_NUMBER
    },
    durationHours: {
      index: 7,
      alpha: "H",
      type: TYPE_NUMBER
    },
    sum: {
      index: 8,
      alpha: "I",
      type: TYPE_NUMBER
    },
    userId: {
      index: 9,
      alpha: "J",
      type: TYPE_STRING
    },
    uuid: {
      index: 10,
      alpha: "K",
      type: TYPE_STRING
    },
    updatedAt: {
      index: 11,
      alpha: "L",
      type: TYPE_ISO_DATE
    },
    userImage: {
      index: 12,
      alpha: "M",
      type: TYPE_STRING
    }
  },

  Progress: {
    userDisplayName: {
      index: 0,
      alpha: "A",
      type: TYPE_STRING
    },
    taskDescription: {
      index: 1,
      alpha: "B",
      type: TYPE_STRING
    },
    project: {
      index: 2,
      alpha: "C",
      type: TYPE_STRING
    },
    tags: {
      index: 3,
      alpha: "D",
      type: TYPE_ARRAY_OF_STRINGS
    },
    startTimeString: {
      index: 4,
      alpha: "E",
      type: TYPE_ISO_DATE
    },
    hourlyRate: {
      index: 5,
      alpha: "F",
      type: TYPE_NUMBER
    },
    userId: {
      index: 6,
      alpha: "G",
      type: TYPE_STRING
    },
    uuid: {
      index: 7,
      alpha: "H",
      type: TYPE_STRING
    },
    updatedAt: {
      index: 8,
      alpha: "I",
      type: TYPE_ISO_DATE
    },
    userImage: {
      index: 9,
      alpha: "J",
      type: TYPE_STRING
    }
  },

  Projects: {
    name: {
      index: 0,
      alpha: "A",
      type: TYPE_STRING
    },
    description: {
      index: 1,
      alpha: "B",
      type: TYPE_STRING
    },
    colorRGB: {
      index: 2,
      alpha: "C",
      type: TYPE_STRING
    },
    uuid: {
      index: 3,
      alpha: "D",
      type: TYPE_STRING
    },
    updatedAt: {
      index: 4,
      alpha: "E",
      type: TYPE_ISO_DATE
    }
  },

  Tags: {
    name: {
      index: 0,
      alpha: "A",
      type: TYPE_STRING
    },
    description: {
      index: 1,
      alpha: "B",
      type: TYPE_STRING
    },
    colorRGB: {
      index: 2,
      alpha: "C",
      type: TYPE_STRING
    },
    uuid: {
      index: 3,
      alpha: "D",
      type: TYPE_STRING
    },
    updatedAt: {
      index: 4,
      alpha: "E",
      type: TYPE_ISO_DATE
    }
  },

  Config: {
    key: {
      index: 0,
      alpha: "A",
      type: TYPE_STRING
    },
    value: {
      index: 1,
      alpha: "B",
      type: TYPE_STRING
    },
    uuid: {
      index: 2,
      alpha: "C",
      type: TYPE_STRING
    },
    updatedAt: {
      index: 3,
      alpha: "D",
      type: TYPE_ISO_DATE
    }
  }
};

const SYNCABLE_STORAGE_UPSERT_LOCAL = "SYNCABLE_STORAGE_UPSERT_LOCAL";
const SYNCABLE_STORAGE_DELETE_LOCAL = "SYNCABLE_STORAGE_DELETE_LOCAL";
const SYNCABLE_STORAGE_REPLACE_ALL_LOCAL = "SYNCABLE_STORAGE_REPLACE_ALL_LOCAL";
const SYNCABLE_STORAGE_SYNC_BEGIN = "SYNCABLE_STORAGE_SYNC_BEGIN";
const SYNCABLE_STORAGE_SYNC_SUCCESS = "SYNCABLE_STORAGE_SYNC_SUCCESS";
const SYNCABLE_STORAGE_SYNC_FAILURE = "SYNCABLE_STORAGE_SYNC_FAILURE";

const upsertLocal = (workspaceId, table, row, synced = false) => ({
  type: SYNCABLE_STORAGE_UPSERT_LOCAL,
  payload: { workspaceId, table, row, synced }
});

const deleteLocal = (workspaceId, table, uuid, synced = false) => ({
  type: SYNCABLE_STORAGE_DELETE_LOCAL,
  payload: { workspaceId, table, uuid, synced }
});

const replaceAllLocal = (workspaceId, table, rows, synced = false) => ({
  type: SYNCABLE_STORAGE_REPLACE_ALL_LOCAL,
  payload: { workspaceId, table, rows, synced }
});

const syncBegin = (workspaceId, table) => ({
  type: SYNCABLE_STORAGE_SYNC_BEGIN,
  payload: { workspaceId, table }
});

const syncSuccess = (workspaceId, table) => ({
  type: SYNCABLE_STORAGE_SYNC_SUCCESS,
  payload: { workspaceId, table }
});

const syncFailure = (workspaceId, table, error) => ({
  type: SYNCABLE_STORAGE_SYNC_FAILURE,
  payload: { workspaceId, table, error }
});

const sync = (workspaceId, tables) => async (dispatch, getState) => {
  try {
    console.assert(
      Array.isArray(tables),
      "Please pass an array of tables to sync instead of string"
    );
    const state = getState();
    const tablesArray = Array.isArray(tables) ? tables : [tables];

    tablesArray.forEach(table => dispatch(syncBegin(workspaceId, table)));
    const gapi = await loadGAPI();
    const ranges = tablesArray.map(table => {
      const tableColumns = tablesConfig[table] || {};
      const firstColumnAlpha = Object.values(tableColumns)
        .map(({ alpha }) => alpha)
        .sort((a, b) => a.localeCompare(b))[0];
      const lastColumnAlpha = Object.values(tableColumns)
        .map(({ alpha }) => alpha)
        .sort((a, b) => b.localeCompare(a))[0];
      return `${table}!${firstColumnAlpha}:${lastColumnAlpha}`;
    });
    const valueRanges = await gapi.client.sheets.spreadsheets.values.batchGet({
      spreadsheetId: workspaceId,
      ranges,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
      majorDimension: "ROWS"
    });
    for (let index = 0; index < tablesArray.length; index++) {
      const table = tablesArray[index];
      try {
        const tableColumns = tablesConfig[table] || {};
        const firstColumnAlpha = Object.values(tableColumns)
          .map(({ alpha }) => alpha)
          .sort((a, b) => a.localeCompare(b))[0];
        const lastColumnAlpha = Object.values(tableColumns)
          .map(({ alpha }) => alpha)
          .sort((a, b) => b.localeCompare(a))[0];
        const data = objectPath
          .get(valueRanges, `result.valueRanges.${index}.values`, [])
          .map(row => {
            const mapped = {};
            for (const key in tableColumns) {
              if (tableColumns.hasOwnProperty(key)) {
                mapped[key] = row[tableColumns[key].index];
              }
            }

            return mapped;
          });
        const lastRowInSpreadsheet = data.length;
        const localRowsToSave = findMany(
          state,
          workspaceId,
          table,
          true
        ).filter(({ _synced }) => !_synced);
        const rangesToClear = [],
          dataToUpdate = [],
          valuesToAppend = [];
        for (const localRow of localRowsToSave) {
          let rowIndex;
          for (let i = 0; i < data.length; i++) {
            if (data[i] && data[i].uuid === localRow.uuid) {
              rowIndex = i;
              break;
            }
          }
          if (rowIndex !== undefined) {
            const row = data[rowIndex];
            const updatedAt = DateTime.fromISO(row.updatedAt);
            const _updatedAt = DateTime.fromISO(localRow._updatedAt);
            if (
              updatedAt.isValid &&
              _updatedAt.isValid &&
              _updatedAt.valueOf() >= updatedAt.valueOf()
            ) {
              if (localRow._deleted) {
                data[rowIndex] = undefined;

                rangesToClear.push(
                  `${table}!${firstColumnAlpha}${rowIndex +
                    1}:${lastColumnAlpha}${rowIndex + 1}`
                );
              } else {
                data[rowIndex] = {
                  ...data[rowIndex],
                  ...localRow,
                  updatedAt: localRow._updatedAt
                };

                const value = [];
                for (const key in tableColumns) {
                  if (tableColumns.hasOwnProperty(key)) {
                    value[tableColumns[key].index] = data[rowIndex][key];
                  }
                }
                dataToUpdate.push({
                  range: `${table}!${firstColumnAlpha}${rowIndex +
                    1}:${lastColumnAlpha}${rowIndex + 1}`,
                  majorDimension: "ROWS",
                  values: [value]
                });
              }
            }
          } else if (!localRow._deleted) {
            const newRow = {
              ...localRow,
              updatedAt: localRow._updatedAt
            };
            data.push(newRow);

            const value = [];
            for (const key in tableColumns) {
              if (tableColumns.hasOwnProperty(key)) {
                value[tableColumns[key].index] = newRow[key];
              }
            }
            valuesToAppend.push(value);
          }
        }
        if (rangesToClear.length > 0) {
          await gapi.client.sheets.spreadsheets.values.batchClear(
            { spreadsheetId: workspaceId },
            { ranges: rangesToClear }
          );
        }
        if (dataToUpdate.length > 0) {
          await gapi.client.sheets.spreadsheets.values.batchUpdate(
            { spreadsheetId: workspaceId },
            {
              valueInputOption: "RAW",
              data: dataToUpdate
            }
          );
        }
        if (valuesToAppend.length > 0) {
          await gapi.client.sheets.spreadsheets.values.append(
            {
              spreadsheetId: workspaceId,
              range: `${table}!${firstColumnAlpha}${lastRowInSpreadsheet +
                1}:${lastColumnAlpha}`,
              valueInputOption: "RAW",
              insertDataOption: "INSERT_ROWS"
            },
            {
              majorDimension: "ROWS",
              values: valuesToAppend
            }
          );
        }
        const dataToInsert = data
          .filter(datum => datum !== undefined)
          .filter(({ uuid }) => !!uuid);
        const start = new Date();
        dispatch(replaceAllLocal(workspaceId, table, dataToInsert, true));
        console.log(`Synced ${table}`, new Date().valueOf() - start.valueOf());
        dispatch(syncSuccess(workspaceId, table));
      } catch (e) {
        dispatch(syncFailure(workspaceId, table, e));
      }
    }
  } catch (e) {
    tables.forEach(table => dispatch(syncFailure(workspaceId, table, e)));
  }
};

export {
  SYNCABLE_STORAGE_UPSERT_LOCAL,
  SYNCABLE_STORAGE_DELETE_LOCAL,
  SYNCABLE_STORAGE_REPLACE_ALL_LOCAL,
  SYNCABLE_STORAGE_SYNC_BEGIN,
  SYNCABLE_STORAGE_SYNC_SUCCESS,
  SYNCABLE_STORAGE_SYNC_FAILURE,
  upsertLocal,
  replaceAllLocal,
  deleteLocal,
  sync
};
