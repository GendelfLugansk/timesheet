import AuthenticatedRoute from "../AuthenticatedRoute/AuthenticatedRoute";
import { Redirect, Switch } from "react-router-dom";
import React, { useEffect, useCallback } from "react";
import CalendarReportsPage from "./CalendarReportPage/CalendarReportPage";
import Filters from "./Filters/Filters";
import SummaryReportPage from "./SummaryReportPage/SummaryReportPage";
import WithWorkspace from "../WithWorkspace/WithWorkspace";
import { useQueryParam, StringParam } from "use-query-params";
import { useDispatch, useSelector } from "react-redux";
import { filtersSelector } from "../../selectors/filters";
import { setFilters } from "../../actions/filters";

const ReportsPage = () => {
  const [filtersFromQueryParams = "", setFiltersQueryParam] = useQueryParam(
    "filters",
    StringParam
  );
  const filtersFromRedux = useSelector(filtersSelector);
  const dispatch = useDispatch();

  const saveFiltersToRedux = useCallback(
    filters => {
      dispatch(setFilters(filters));
    },
    [dispatch]
  );

  useEffect(() => {
    if (
      typeof filtersFromQueryParams === "string" &&
      filtersFromQueryParams.length > 0 &&
      !filtersFromRedux
    ) {
      saveFiltersToRedux(filtersFromQueryParams);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersFromQueryParams]);

  useEffect(() => {
    if (filtersFromRedux !== filtersFromQueryParams) {
      setFiltersQueryParam(filtersFromRedux);
    }
  });

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
