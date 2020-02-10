import React, { memo } from "react";
import { Duration } from "luxon";

const TotalHours = memo(({ logItems, isSyncing }) => {
  const totalHours = Duration.fromObject({
    hours: logItems
      .filter(({ durationHours }) => typeof durationHours === "number")
      .reduce((acc, { durationHours }) => acc + durationHours, 0)
  }).toFormat("hh:mm:ss");

  return (
    <>
      <h3 className="uk-heading-small uk-text-bold uk-text-center uk-margin-remove-top">
        {totalHours}
      </h3>
    </>
  );
});

export default TotalHours;
