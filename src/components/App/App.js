import "./App.scss";

import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AuthenticatedRoute from "../AuthenticatedRoute/AuthenticatedRoute";
import LoginPage from "../LoginPage/LoginPage";
import SideBar from "../SideBar/SideBar";
import DocumentTitle from "../DocumentTitle/DocumentTitle";
import HomePage from "../HomePage/HomePage";
import NotFoundPage from "../NotFoundPage/NotFoundPage";
import ReportsPage from "../ReportsPage/ReportsPage";
import FetchAll from "../FetchAll/FetchAll";

const App = () => (
  <Router>
    <DocumentTitle title="Timesheet" />
    <FetchAll>
      <div className="uk-flex App">
        <SideBar />

        <div className="uk-flex-1 uk-padding-small">
          <Switch>
            <AuthenticatedRoute exact path="/">
              <HomePage />
            </AuthenticatedRoute>
            <AuthenticatedRoute path="/reports">
              <ReportsPage />
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
    </FetchAll>
  </Router>
);

export default App;
