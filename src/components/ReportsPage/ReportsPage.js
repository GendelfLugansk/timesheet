import AuthenticatedRoute from "../AuthenticatedRoute/AuthenticatedRoute";
import { Redirect, Switch } from "react-router-dom";
import React, { useEffect, useCallback } from "react";
import CalendarReportsPage from "./CalendarReportPage/CalendarReportPage";
import Filters from "./Filters/Filters";
import SummaryReportPage from "./SummaryReportPage/SummaryReportPage";
import SummaryEarningsReportPage from "./SummaryEarningsReportPage/SummaryEarningsReportPage";
import WithWorkspace from "../WithWorkspace/WithWorkspace";
import { useQueryParam, StringParam } from "use-query-params";
import { useDispatch, useSelector } from "react-redux";
import { filtersSelector } from "../../selectors/filters";
import { setFilters } from "../../actions/filters";
import DocumentTitle from "../DocumentTitle/DocumentTitle";
import { useTranslation } from "react-i18next";
import i18n from "../../utils/i18n";
import en from "./ReportsPage.en";
import ru from "./ReportsPage.ru";
import uuidv4 from "uuid/v4";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const ReportsPage = () => {
  const { t } = useTranslation(ns);
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
    <>
      <DocumentTitle title={t("documentTitle")} />
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
            <AuthenticatedRoute exact path="/reports/summary-earnings">
              <SummaryEarningsReportPage />
            </AuthenticatedRoute>
            <AuthenticatedRoute exact path="/reports/calendar">
              <CalendarReportsPage />
            </AuthenticatedRoute>
          </Switch>
        </div>
      </WithWorkspace>
    </>
  );
};

export default ReportsPage;
