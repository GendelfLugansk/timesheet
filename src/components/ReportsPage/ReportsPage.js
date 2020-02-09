import AuthenticatedRoute from "../AuthenticatedRoute/AuthenticatedRoute";
import { Redirect, Switch } from "react-router-dom";
import React from "react";
import CalendarReportsPage from "./CalendarReportPage/CalendarReportPage";
import Filters from "./Filters/Filters";
import SummaryReportPage from "./SummaryReportPage/SummaryReportPage";
import WithWorkspace from "../WithWorkspace/WithWorkspace";

const ReportsPage = () => {
  return (
    <WithWorkspace>
      <div className="uk-width-1-1 uk-position-relative">
        <Filters />
        <Switch>
          <AuthenticatedRoute exact path="/reports">
            <Redirect to="/reports/summary" />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/reports/summary">
            <SummaryReportPage />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/reports/calendar">
            <CalendarReportsPage />
          </AuthenticatedRoute>
        </Switch>
      </div>
    </WithWorkspace>
  );
};

export default ReportsPage;
