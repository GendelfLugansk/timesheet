import "./App.scss";

import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AuthenticatedRoute from "../AuthenticatedRoute/AuthenticatedRoute";
import LoginPage from "../LoginPage/LoginPage";
import SideBar from "../SideBar/SideBar";
import DocumentTitle from "../DocumentTitle/DocumentTitle";
import HomePage from "../HomePage/HomePage";
import NotFoundPage from "../NotFoundPage/NotFoundPage";

const App = () => (
  <Router>
    <DocumentTitle title="Timesheets" />
    <div className="uk-flex App">
      <SideBar />

      <div className="uk-flex-1 uk-padding-small">
        <Switch>
          <AuthenticatedRoute exact path="/">
            <HomePage />
          </AuthenticatedRoute>
          <Route path="/login">
            <LoginPage />
          </Route>
          <Route path="*">
            <NotFoundPage />
          </Route>
        </Switch>
      </div>
    </div>
  </Router>
);

export default App;