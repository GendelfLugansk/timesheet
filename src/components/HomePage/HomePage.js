import React from "react";
import Timer from "./Timer/Timer";
import Log from "./Log/Log";
import WithWorkspace from "../WithWorkspace/WithWorkspace";

const HomePage = () => {
  return (
    <WithWorkspace>
      <Timer />
      <Log />
    </WithWorkspace>
  );
};

export default HomePage;
