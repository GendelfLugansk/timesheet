import React from "react";
import uuidv4 from "uuid/v4";
import i18n from "../../utils/i18n";
import en from "./TermsOfServicePage.en";
import ru from "./TermsOfServicePage.ru";
import { useTranslation } from "react-i18next";
import ReactHtmlParser from "react-html-parser";
import DocumentTitle from "../DocumentTitle/DocumentTitle";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const TermsOfServicePage = () => {
  const { t } = useTranslation(ns);

  return (
    <>
      <DocumentTitle title={t("documentTitle")} />
      <div className="uk-padding-small">{ReactHtmlParser(t("text"))}</div>
    </>
  );
};

export default TermsOfServicePage;
