import React from "react";

const PrintableLogo = () => (
  <div className="uk-text-uppercase uk-text-bold uk-text-emphasis uk-text-lead uk-text-middle">
    <img
      data-src={process.env.PUBLIC_URL + "/logo512.png"}
      width="30"
      height="30"
      alt=""
      uk-img={process.env.PUBLIC_URL + "/logo512.png"}
      style={{ position: "relative", top: "-2px" }}
    />
    Timesheet
  </div>
);

export default PrintableLogo;
