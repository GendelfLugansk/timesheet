import React from "react";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";
import en from "./HomePage.en";
import ru from "./HomePage.ru";

const ns = "HomePage";
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const HomePage = () => {
  const { t } = useTranslation(ns);

  return (
    <div>
      <h2>{t("title")}</h2>
    </div>
  );
};

export default HomePage;
