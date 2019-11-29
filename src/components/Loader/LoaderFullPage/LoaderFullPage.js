import React from "react";
import Loader from "../Loader";
import "./LoaderFullPage.scss";

const LoaderFullPage = ({ ratio = 3 }) => (
  <div className="uk-flex uk-flex-center uk-flex-middle LoaderFullPage">
    <div>
      <Loader ratio={ratio} />
    </div>
  </div>
);

export default LoaderFullPage;
