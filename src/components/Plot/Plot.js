import React, { useEffect, useState } from "react";
import deepcopy from "deepcopy";
import uuidv4 from "uuid";
import Plotly from "plotly.js";
import { useTranslation } from "react-i18next";
import plotlyLocaleRu from "../../utils/plotlyLocaleRu";
import "./Plot.scss";
import { colors } from "../../utils/chartColors";

plotlyLocaleRu(Plotly);

const defaultConfig = {
  responsive: true,
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ["toImage", "sendDataToCloud", "select2d", "lasso2d"]
};

const defaultLayout = {
  autosize: true,
  colorway: [...colors],
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)"
};

const Plot = ({
  data = [],
  layout = defaultLayout,
  config = defaultConfig
}) => {
  const { i18n } = useTranslation();
  const [elId] = useState(uuidv4());

  useEffect(() => {
    const plotlyConfig = deepcopy(config);
    plotlyConfig.locale = i18n.language;

    Plotly.react(elId, deepcopy(data), deepcopy(layout), plotlyConfig);
  }, [elId, data, layout, config, i18n.language]);

  useEffect(() => {
    //Plotly.relayout(elId);
    //window.dispatchEvent(new Event("resize"));
  }, []);

  return (
    <div className="Plot">
      <div id={elId} />
    </div>
  );
};

export { defaultConfig, defaultLayout };

export default Plot;
