import React, { memo } from "react";
import { Duration } from "luxon";
import en from "./TotalHours.en";
import ru from "./TotalHours.ru";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import uuidv4 from "uuid/v4";
import Loader from "../../../Loader/Loader";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const TotalHours = memo(({ logItems, isSyncing }) => {
  const { t } = useTranslation(ns);
  const totalHours = Duration.fromObject({
    hours: logItems
      .filter(({ durationHours }) => typeof durationHours === "number")
      .reduce((acc, { durationHours }) => acc + durationHours, 0)
  }).toFormat("hh:mm:ss");

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
        {totalHours}
      </h3>
    </>
  );
});

export default TotalHours;
