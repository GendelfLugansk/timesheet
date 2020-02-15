import loadGAPI from "../utils/googleapi";

const workspaceKey = `__timesheet_workspace`;

const FETCH_WORKSPACES_BEGIN = "FETCH_WORKSPACES_BEGIN";
const FETCH_WORKSPACES_SUCCESS = "FETCH_WORKSPACES_SUCCESS";
const FETCH_WORKSPACES_FAILURE = "FETCH_WORKSPACES_FAILURE";
const SELECT_WORKSPACE = "SELECT_WORKSPACE";

const fetchWorkspacesBegin = () => ({ type: FETCH_WORKSPACES_BEGIN });

const fetchWorkspacesSuccess = workspaces => ({
  type: FETCH_WORKSPACES_SUCCESS,
  payload: { workspaces }
});

const fetchWorkspacesFailure = error => ({
  type: FETCH_WORKSPACES_FAILURE,
  payload: { error }
});

const selectWorkspace = workspace => ({
  type: SELECT_WORKSPACE,
  payload: { workspace }
});

const fetchWorkspaces = (allowConcurrency = false, autoselect = true) => async (
  dispatch,
  getState
) => {
  try {
    const {
      auth: { currentUser: { email } = {} } = {},
      workspaces: { isLoading }
    } = getState();

    if (isLoading && !allowConcurrency) {
      return;
    }

    dispatch(fetchWorkspacesBegin());
    const gapi = await loadGAPI();
    const workspaces = [];
    let pageToken,
      first = true;
    const regex = `^${workspaceKey}(__(-?\\d+)__)?`;
    while (first || pageToken) {
      first = false;
      const {
        result: { nextPageToken, files }
      } = await gapi.client.drive.files.list({
        q: `name contains '${workspaceKey}' and mimeType = 'application/vnd.google-apps.spreadsheet' and '${email}' in writers and trashed = false`,
        fields: "nextPageToken, files(id, name, owners, ownedByMe)",
        pageToken
      });
      pageToken = nextPageToken;
      workspaces.push(
        ...files
          .filter(({ name }) => new RegExp(regex).test(name))
          .map(file => ({
            ...file,
            nameShort: file.name.replace(new RegExp(regex), ""),
            sortOrder: Number(
              (file.name.match(new RegExp(regex)) || [])[2] ||
                Number.MAX_SAFE_INTEGER
            )
          }))
      );
    }
    workspaces.sort((a, b) => a.sortOrder - b.sortOrder);
    dispatch(fetchWorkspacesSuccess(workspaces));
    if (autoselect && workspaces.length > 0) {
      dispatch(selectWorkspace(workspaces[0]));
    }
  } catch (e) {
    dispatch(fetchWorkspacesFailure(e));
  }
};

const createWorkspace = (
  { name, sortOrder },
  selectCreatedWorkspace = false
) => async (dispatch, getState) => {
  try {
    const gapi = await loadGAPI();
    const {
      result: { spreadsheetId }
    } = await gapi.client.sheets.spreadsheets.create({
      properties: {
        title: [
          workspaceKey,
          typeof sortOrder === "number" ? sortOrder : undefined,
          name
        ]
          .filter(s => ["string", "number"].includes(typeof s))
          .join("__")
      },
      sheets: [
        { properties: { title: "Log", gridProperties: { rowCount: 1 } } },
        { properties: { title: "Progress", gridProperties: { rowCount: 1 } } },
        { properties: { title: "Projects", gridProperties: { rowCount: 1 } } },
        { properties: { title: "Tags", gridProperties: { rowCount: 1 } } },
        { properties: { title: "Config", gridProperties: { rowCount: 1 } } }
      ]
    });
    await dispatch(fetchWorkspaces(true, !selectCreatedWorkspace));
    if (selectCreatedWorkspace) {
      const {
        workspaces: { list }
      } = getState();
      for (const item of list) {
        if (item.id === spreadsheetId) {
          dispatch(selectWorkspace(item));
          break;
        }
      }
    }
    return spreadsheetId;
  } catch (e) {
    throw e;
  }
};

const removeWorkspace = id => async dispatch => {
  try {
    const gapi = await loadGAPI();
    await gapi.client.drive.files.update({
      fileId: id,
      trashed: true
    });
    await dispatch(fetchWorkspaces(true, false));
  } catch (e) {
    throw e;
  }
};

const editWorkspace = (id, { name, sortOrder }) => async (
  dispatch,
  getState
) => {
  try {
    const gapi = await loadGAPI();
    await gapi.client.drive.files.update({
      fileId: id,
      name: [
        workspaceKey,
        typeof sortOrder === "number" ? sortOrder : undefined,
        name
      ]
        .filter(s => ["string", "number"].includes(typeof s))
        .join("__")
    });
    await dispatch(fetchWorkspaces(true, false));
    const {
      workspaces: { list }
    } = getState();
    for (const item of list) {
      if (item.id === id) {
        dispatch(selectWorkspace(item));
        break;
      }
    }
  } catch (e) {
    throw e;
  }
};

export {
  FETCH_WORKSPACES_BEGIN,
  FETCH_WORKSPACES_SUCCESS,
  FETCH_WORKSPACES_FAILURE,
  SELECT_WORKSPACE,
  fetchWorkspaces,
  createWorkspace,
  selectWorkspace,
  removeWorkspace,
  editWorkspace
};
