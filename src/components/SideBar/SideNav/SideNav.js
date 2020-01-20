import React from "react";
import LinkWrapper from "./LinkWrapper/LinkWrapper";
import { Link } from "react-router-dom";
import i18n from "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./SideNav.en";
import ru from "./SideNav.ru";

const ns = "SideNav";
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const SideNav = () => {
  const { t } = useTranslation(ns);

  return (
    <ul className="uk-nav uk-nav-default">
      <LinkWrapper
        exact
        authenticated={true}
        to="/"
        activeClassName="uk-active"
      >
        <Link to="/">{t("home")}</Link>
      </LinkWrapper>
      <LinkWrapper
        authenticated={true}
        to="/reports"
        activeClassName="uk-active"
        className="uk-parent"
      >
        <Link to="/reports">{t("reports.index")}</Link>
        <ul className="uk-nav-sub">
          <LinkWrapper
            authenticated={true}
            to="/reports/summary"
            activeClassName="uk-active"
          >
            <Link to="/reports/summary">{t("reports.summary")}</Link>
          </LinkWrapper>
          <LinkWrapper
            authenticated={true}
            to="/reports/calendar"
            activeClassName="uk-active"
          >
            <Link to="/reports/calendar">{t("reports.calendar")}</Link>
          </LinkWrapper>
        </ul>
      </LinkWrapper>
      <LinkWrapper
        authenticated={false}
        to="/login"
        activeClassName="uk-active"
      >
        <Link to="/login">{t("login")}</Link>
      </LinkWrapper>
    </ul>
  );
};

export default SideNav;
