import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import "./polyfills";
import "uikit/dist/css/uikit.css";
import "./styles/index.scss";
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App/App";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import "./utils/i18n";
import store from "./stores/store";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
