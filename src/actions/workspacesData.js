import loadGAPI from "../utils/googleapi";
import objectPath from "object-path";
import uuidv4 from "uuid/v4";

const FETCH_WORKSPACE_DATA_BEGIN = "FETCH_WORKSPACE_DATA_BEGIN";
const FETCH_WORKSPACE_DATA_SUCCESS = "FETCH_WORKSPACE_DATA_SUCCESS";
const FETCH_WORKSPACE_DATA_FAILURE = "FETCH_WORKSPACE_DATA_FAILURE";
const UPDATE_WORKSPACE_DATA_TIMER_IN_PROGRESS =
  "UPDATE_WORKSPACE_DATA_TIMER_IN_PROGRESS";

const logColumns = {
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
  }
};

const progressColumns = {
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
  }
};

const projectsColumns = {
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
  }
};

const tagsColumns = {
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
  }
};

const fetchWorkspaceDataBegin = workspaceId => ({
  type: FETCH_WORKSPACE_DATA_BEGIN,
  payload: { workspaceId }
});

const fetchWorkspaceDataSuccess = (workspaceId, workspaceData) => ({
  type: FETCH_WORKSPACE_DATA_SUCCESS,
  payload: { workspaceId, workspaceData }
});

const fetchWorkspaceDataFailure = (workspaceId, error) => ({
  type: FETCH_WORKSPACE_DATA_FAILURE,
  payload: { workspaceId, error }
});

const updateWorkspaceDataTimerInProgress = (workspaceId, timerInProgress) => ({
  type: UPDATE_WORKSPACE_DATA_TIMER_IN_PROGRESS,
  payload: { workspaceId, timerInProgress }
});

const fetchWorkspaceData = (workspaceId, allowConcurrency = false) => async (
  dispatch,
  getState
) => {
  try {
    const {
      auth: { currentUser: { id: userId, name: userName } = {} } = {},
      workspacesData
    } = getState();

    const isLoading = objectPath.get(
      workspacesData,
      `${workspaceId}.isLoading`,
      false
    );

    if (isLoading && !allowConcurrency) {
      return;
    }

    dispatch(fetchWorkspaceDataBegin(workspaceId));
    const gapi = await loadGAPI();
    const { result: spreadsheet } = await gapi.client.sheets.spreadsheets.get({
      spreadsheetId: workspaceId
    });
    const valueRanges = await gapi.client.sheets.spreadsheets.values.batchGet({
      spreadsheetId: workspaceId,
      ranges: [
        "Progress!A1:" +
          Object.values(progressColumns)
            .map(({ alpha }) => alpha)
            .sort((a, b) => b.localeCompare(a))[0],
        "Projects!A1:" +
          Object.values(projectsColumns)
            .map(({ alpha }) => alpha)
            .sort((a, b) => b.localeCompare(a))[0],
        "Tags!A1:" +
          Object.values(tagsColumns)
            .map(({ alpha }) => alpha)
            .sort((a, b) => b.localeCompare(a))[0]
      ],
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
      majorDimension: "ROWS"
    });
    const progressTable = objectPath
      .get(valueRanges, "result.valueRanges.1.values", [])
      .map(row => {
        const mapped = {};
        for (const key in progressColumns) {
          if (progressColumns.hasOwnProperty(key)) {
            mapped[key] = row[progressColumns[key].index];
          }
        }

        return mapped;
      });
    const projectsTable = objectPath
      .get(valueRanges, "result.valueRanges.2.values", [])
      .map(row => {
        const mapped = {};
        for (const key in projectsColumns) {
          if (projectsColumns.hasOwnProperty(key)) {
            mapped[key] = row[projectsColumns[key].index];
          }
        }

        return mapped;
      });
    const tagsTable = objectPath
      .get(valueRanges, "result.valueRanges.3.values", [])
      .map(row => {
        const mapped = {};
        for (const key in tagsColumns) {
          if (tagsColumns.hasOwnProperty(key)) {
            mapped[key] = row[tagsColumns[key].index];
          }
        }

        return mapped;
      });
    //TODO: break thing in multiple actions, per table
    const timerFromProgressTable = objectPath.get(
      progressTable.filter(row => row.userId === userId),
      0,
      {}
    );
    const timerInProgress = objectPath.get(
      workspacesData,
      `${workspaceId}.timerInProgress`,
      {}
    );
    dispatch(
      fetchWorkspaceDataSuccess(workspaceId, {
        spreadsheet,
        progressTable: { data: progressTable },
        projectsTable: { data: projectsTable },
        tagsTable: { data: tagsTable },
        timerInProgress: timerInProgress.uuid
          ? timerInProgress
          : {
              userDisplayName: userName,
              taskDescription: "",
              project: "",
              tags: "",
              startTimeString: "",
              hourlyRate: "",
              userId: userId,
              uuid: uuidv4(),
              started: !!timerFromProgressTable.startTimeString,
              ...timerFromProgressTable
            }
      })
    );
  } catch (e) {
    dispatch(fetchWorkspaceDataFailure(workspaceId, e));
  }
};

export {
  FETCH_WORKSPACE_DATA_BEGIN,
  FETCH_WORKSPACE_DATA_SUCCESS,
  FETCH_WORKSPACE_DATA_FAILURE,
  UPDATE_WORKSPACE_DATA_TIMER_IN_PROGRESS,
  updateWorkspaceDataTimerInProgress,
  fetchWorkspaceData
};
