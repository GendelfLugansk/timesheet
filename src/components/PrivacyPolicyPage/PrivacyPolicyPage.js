import React from "react";
import uuidv4 from "uuid/v4";
import i18n from "../../utils/i18n";
import en from "./PrivacyPolicyPage.en";
import ru from "./PrivacyPolicyPage.ru";
import { useTranslation } from "react-i18next";
import ReactHtmlParser from "react-html-parser";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const PrivacyPolicyPage = () => {
  const { t } = useTranslation(ns);

  return <div className="uk-padding-small">{ReactHtmlParser(t("text"))}</div>;
};

export default PrivacyPolicyPage;
