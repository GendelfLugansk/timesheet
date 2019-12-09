import loadGAPI from "../utils/googleapi";

const workspaceKey = `__timesheets_workspace`;

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

const fetchWorkspaces = (allowConcurrency = false) => async (
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
    if (workspaces.length > 0) {
      dispatch(selectWorkspace(workspaces[0]));
    }
  } catch (e) {
    dispatch(fetchWorkspacesFailure(e));
  }
};

const createWorkspace = ({ name, sortOrder }) => async dispatch => {
  try {
    const gapi = await loadGAPI();
    await gapi.client.sheets.spreadsheets.create({
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
        { properties: { title: "Tags", gridProperties: { rowCount: 1 } } }
      ]
    });
    await dispatch(fetchWorkspaces(true));
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
  selectWorkspace
};
