import React from "react";
import LinkWrapper from "./LinkWrapper";
import { Link } from "react-router-dom";
import i18n from "../../../i18n";
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
