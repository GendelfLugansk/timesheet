import React from "react";
import uuidv4 from "uuid/v4";
import i18n from "../../utils/i18n";
import en from "./AboutPage.en";
import ru from "./AboutPage.ru";
import { useTranslation } from "react-i18next";
import DocumentTitle from "../DocumentTitle/DocumentTitle";
import { Link } from "react-router-dom";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const AboutPage = () => {
  const { t } = useTranslation(ns);

  return (
    <>
      <DocumentTitle title={t("documentTitle")} />
      <div className="uk-flex uk-flex-center uk-flex-middle min-height-100">
        <div className="uk-padding-large">
          <h1 className="uk-heading-large">{t("header")}</h1>
          <p className="uk-text-lead">{t("text")}</p>
          <p>
            <Link
              to="/"
              className="uk-button uk-button-large uk-button-primary"
            >
              {t("ctaButton")}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
