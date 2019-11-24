let gapiLoaded = false;
let auth2Loaded = false;

const timeoutReject = (milliseconds, reason) =>
  new Promise((_, reject) => setTimeout(() => reject(reason), milliseconds));

const loadGAPI = () => {
  return Promise.race([
    timeoutReject(15000, "Failed to load Google API"),
    new Promise((accept, reject) => {
      const CLIENT_ID = process.env.REACT_APP_GAPI_CLIENT_ID;
      const API_KEY = process.env.REACT_APP_GAPI_API_KEY;
      const DISCOVERY_DOCS = [
        "https://sheets.googleapis.com/$discovery/rest?version=v4",
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
      ];
      const SCOPES = "https://www.googleapis.com/auth/drive.file";

      function initClient() {
        try {
          const { gapi } = window;

          gapi.client
            .init({
              apiKey: API_KEY,
              clientId: CLIENT_ID,
              discoveryDocs: DISCOVERY_DOCS,
              scope: SCOPES
            })
            .then(() => {
              auth2Loaded = true;
              accept(gapi);
            }, reject);
        } catch (e) {
          reject(e);
        }
      }

      function handleGClientLoad() {
        try {
          gapiLoaded = true;
          window.gapi.load("client:auth2", initClient);
        } catch (e) {
          reject(e);
        }
      }

      try {
        //Append google's API script
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.defer = true;
        script.onload = function() {
          this.onload = function() {};
          handleGClientLoad();
        };
        script.onerror = function(error) {
          reject(error);
        };
        script.onreadystatechange = function() {
          if (["complete", "loaded"].includes(this.readyState)) {
            this.onload();
          }
        };
        script.src = "https://apis.google.com/js/api.js";
        document.head.appendChild(script);
      } catch (e) {
        reject(e);
      }
    })
  ]);
};

let activePromise = undefined;

const maybeLoadGAPI = async () => {
  if (gapiLoaded && auth2Loaded && window.gapi) {
    return window.gapi;
  }

  if (activePromise) {
    return await activePromise;
  }

  activePromise = loadGAPI();
  const gapi = await activePromise;
  activePromise = undefined;

  return gapi;
};

export default maybeLoadGAPI;
