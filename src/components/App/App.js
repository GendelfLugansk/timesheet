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
import PrivacyPolicyPage from "../PrivacyPolicyPage/PrivacyPolicyPage";
import TermsOfServicePage from "../TermsOfServicePage/TermsOfServicePage";
import AboutPage from "../AboutPage/AboutPage";

const App = () => (
  <Router>
    <QueryParamProvider ReactRouterRoute={Route}>
      <DocumentTitle title="Timesheet" />
      <FetchAll>
        <div className="uk-flex uk-flex-column uk-flex-stretch App">
          <MobileSideBar />
          <div className="uk-flex uk-flex-1">
            <SideBar addClassName="uk-visible@l" />

            <div className="uk-flex-1 uk-padding-small uk-position-relative">
              <Switch>
                <AuthenticatedRoute exact path="/">
                  <HomePage />
                </AuthenticatedRoute>
                <AuthenticatedRoute path="/reports">
                  <ReportsPage />
                </AuthenticatedRoute>
                <Route path="/about">
                  <AboutPage />
                </Route>
                <Route path="/privacy">
                  <PrivacyPolicyPage />
                </Route>
                <Route path="/tos">
                  <TermsOfServicePage />
                </Route>
                <Route path="/login">
                  <LoginPage />
                </Route>
                <Route path="*">
                  <NotFoundPage />
                </Route>
              </Switch>

              <div className="uk-margin-top" />
              <div className="uk-position-absolute uk-position-bottom-center unprintable uk-text-small uk-padding-small">
                &copy; {new Date().getFullYear()},{" "}
                <a
                  href="https://gennady.pp.ua/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Gennady Dogaev
                </a>{" "}
                Source code of this app is available{" "}
                <a
                  href="https://github.com/GendelfLugansk/timesheet"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </FetchAll>
    </QueryParamProvider>
  </Router>
);

export default App;
