import objectPath from "object-path";
import loadGAPI from "../utils/googleapi";
import uuidv4 from "uuid/v4";
import { DateTime } from "luxon";

const tablesConfig = {
  Log: {
    userDisplayName: {
      index: 0,
      alpha: "A"
    },
    taskDescription: {
      index: 1,
      alpha: "B"
    },
    project: {
      index: 2,
      alpha: "C"
    },
    tags: {
      index: 3,
      alpha: "D"
    },
    startTimeString: {
      index: 4,
      alpha: "E"
    },
    endTimeString: {
      index: 5,
      alpha: "F"
    },
    hourlyRate: {
      index: 6,
      alpha: "G"
    },
    durationHours: {
      index: 7,
      alpha: "H"
    },
    sum: {
      index: 8,
      alpha: "I"
    },
    userId: {
      index: 9,
      alpha: "J"
    },
    uuid: {
      index: 10,
      alpha: "K"
    },
    updatedAt: {
      index: 11,
      alpha: "L"
    },
    userImage: {
      index: 12,
      alpha: "M"
    }
  },

  Progress: {
    userDisplayName: {
      index: 0,
      alpha: "A"
    },
    taskDescription: {
      index: 1,
      alpha: "B"
    },
    project: {
      index: 2,
      alpha: "C"
    },
    tags: {
      index: 3,
      alpha: "D"
    },
    startTimeString: {
      index: 4,
      alpha: "E"
    },
    hourlyRate: {
      index: 5,
      alpha: "F"
    },
    userId: {
      index: 6,
      alpha: "G"
    },
    uuid: {
      index: 7,
      alpha: "H"
    },
    updatedAt: {
      index: 8,
      alpha: "I"
    },
    userImage: {
      index: 9,
      alpha: "J"
    }
  },

  Projects: {
    name: {
      index: 0,
      alpha: "A"
    },
    description: {
      index: 1,
      alpha: "B"
    },
    colorRGB: {
      index: 2,
      alpha: "C"
    },
    uuid: {
      index: 3,
      alpha: "D"
    },
    updatedAt: {
      index: 4,
      alpha: "E"
    }
  },

  Tags: {
    name: {
      index: 0,
      alpha: "A"
    },
    description: {
      index: 1,
      alpha: "B"
    },
    colorRGB: {
      index: 2,
      alpha: "C"
    },
    uuid: {
      index: 3,
      alpha: "D"
    },
    updatedAt: {
      index: 4,
      alpha: "E"
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

const sync = (workspaceId, table, allowConcurrency = false) => async (
  dispatch,
  getState
) => {
  try {
    const { syncableStorage } = getState();

    const isLoading = objectPath.get(
      syncableStorage,
      `${workspaceId}.${table}.isSyncing`,
      false
    );

    if (isLoading && !allowConcurrency) {
      return;
    }

    dispatch(syncBegin(workspaceId, table));
    const gapi = await loadGAPI();
    const tableColumns = tablesConfig[table] || {};
    const ranges = [];
    const firstColumnAlpha = Object.values(tableColumns)
      .map(({ alpha }) => alpha)
      .sort((a, b) => a.localeCompare(b))[0];
    const lastColumnAlpha = Object.values(tableColumns)
      .map(({ alpha }) => alpha)
      .sort((a, b) => b.localeCompare(a))[0];
    ranges.push(`${table}!${firstColumnAlpha}:${lastColumnAlpha}`);
    const valueRanges = await gapi.client.sheets.spreadsheets.values.batchGet({
      spreadsheetId: workspaceId,
      ranges,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
      majorDimension: "ROWS"
    });
    const data = objectPath
      .get(valueRanges, "result.valueRanges.0.values", [])
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
    const localRowsToSave = objectPath
      .get(syncableStorage, `${workspaceId}.${table}.data`, [])
      .filter(({ _synced }) => !_synced);
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
    dispatch(
      replaceAllLocal(
        workspaceId,
        table,
        data.filter(datum => datum !== undefined).filter(({ uuid }) => !!uuid),
        true
      )
    );
    dispatch(syncSuccess(workspaceId, table));
  } catch (e) {
    dispatch(syncFailure(workspaceId, table, e));
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
  deleteLocal,
  sync
};
