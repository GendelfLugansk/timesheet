import React from "react";

const Loader = ({ ratio = 3 }) => <div uk-spinner={`ratio: ${ratio}`} />;

export default Loader;
