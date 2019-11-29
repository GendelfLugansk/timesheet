import React from "react";
import DocumentTitle from "../DocumentTitle/DocumentTitle";
import i18n from "../../utils/i18n";
import { useTranslation } from "react-i18next";
import en from "./NotFoundPage.en";
import ru from "./NotFoundPage.ru";

const ns = "NotFoundPage";
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const NotFoundPage = () => {
  const { t } = useTranslation(ns);

  return (
    <>
      <DocumentTitle title="Sign In" />
      <div className="uk-flex uk-flex-center uk-flex-middle min-height-100">
        <div className="uk-width-2-3">
          <h2 className="uk-heading-small">{t("text")}</h2>
          <h1 className="uk-heading-2xlarge">404</h1>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
