import "./App.scss";

import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AuthenticatedRoute from "../AuthenticatedRoute/AuthenticatedRoute";
import LoginPage from "../LoginPage/LoginPage";
import SideNav from "../SideNav/SideNav";
import DocumentTitle from "../DocumentTitle/DocumentTitle";

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
);

const About = () => (
  <>
    <DocumentTitle title="About" />
    <div>
      <h2>About</h2>
    </div>
  </>
);

const App = () => (
  <Router>
    <DocumentTitle title="Timesheets" />
    <div className="uk-flex App">
      <SideNav />

      <div className="uk-flex-1 uk-padding-small">
        <Switch>
          <AuthenticatedRoute exact path="/">
            <Home />
          </AuthenticatedRoute>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/login">
            <LoginPage />
          </Route>
        </Switch>
      </div>
    </div>
  </Router>
);

export default App;
