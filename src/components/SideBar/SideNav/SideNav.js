import React from "react";
import LinkWrapper from "./LinkWrapper/LinkWrapper";
import { Link } from "react-router-dom";
import i18n from "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./SideNav.en";
import ru from "./SideNav.ru";
import uuidv4 from "uuid/v4";

const ns = uuidv4();
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
            to="/reports/summary-earnings"
            activeClassName="uk-active"
          >
            <Link to="/reports/summary-earnings">
              {t("reports.summaryEarnings")}
            </Link>
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
      <LinkWrapper to="/about" activeClassName="uk-active">
        <Link to="/about">{t("about")}</Link>
      </LinkWrapper>
      <LinkWrapper to="/privacy" activeClassName="uk-active">
        <Link to="/privacy">{t("privacy")}</Link>
      </LinkWrapper>
      <LinkWrapper to="/tos" activeClassName="uk-active">
        <Link to="/tos">{t("tos")}</Link>
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
