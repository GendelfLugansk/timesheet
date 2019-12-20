import React from "react";
import Loader from "../Loader";
import "./LoaderOverlay.scss";

const LoaderOverlay = ({ ratio = 3, opacity = 0.8 }) => (
  <div
    className="uk-flex uk-flex-center uk-flex-middle LoaderOverlay"
    style={{ opacity }}
  >
    <div>
      <Loader ratio={ratio} />
    </div>
  </div>
);

export default LoaderOverlay;
