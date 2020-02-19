import React, { memo } from "react";
import en from "./TotalEarnings.en";
import ru from "./TotalEarnings.ru";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import uuidv4 from "uuid/v4";
import Loader from "../../../Loader/Loader";
import numeral from "numeral";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const TotalEarnings = memo(({ logItems, isSyncing }) => {
  const { t } = useTranslation(ns);
  const totalEarnings = numeral(
    logItems
      .filter(({ sum }) => typeof sum === "number")
      .reduce((acc, { sum }) => acc + sum, 0)
  ).format("$0,0.00");

  if (isSyncing && logItems.length === 0) {
    return (
      <div className="uk-flex uk-flex-center uk-flex-middle uk-background-muted uk-padding-small">
        <div>
          <Loader ratio={2} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="uk-text-uppercase uk-text-center uk-text-lead">
        {t("title")}
      </div>
      <h3 className="uk-heading-small uk-text-bold uk-text-center uk-margin-remove-top">
        {totalEarnings}
      </h3>
    </>
  );
});

export default TotalEarnings;
