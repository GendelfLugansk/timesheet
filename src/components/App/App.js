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
import { QueryParamProvider } from "use-query-params";
import MobileSideBar from "../SideBar/MobileSideBar/MobileSideBar";

const App = () => (
  <Router>
    <QueryParamProvider ReactRouterRoute={Route}>
      <DocumentTitle title="Timesheet" />
      <FetchAll>
        <div className="uk-flex uk-flex-column uk-flex-stretch App">
          <MobileSideBar />
          <div className="uk-flex uk-flex-1">
            <SideBar addClassName="uk-visible@l" />

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
        </div>
      </FetchAll>
    </QueryParamProvider>
  </Router>
);

export default App;
