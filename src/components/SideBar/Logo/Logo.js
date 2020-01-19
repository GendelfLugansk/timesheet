import React from "react";

const Logo = () => (
  <div className="uk-text-uppercase uk-text-bold uk-text-emphasis uk-text-lead">
    <img
      className="uk-background-default uk-margin-small-right"
      data-src={process.env.PUBLIC_URL + "/logo512.png"}
      width="25"
      height="25"
      alt=""
      uk-img={process.env.PUBLIC_URL + "/logo512.png"}
    />
    Timesheet
    <hr />
  </div>
);

export default Logo;
