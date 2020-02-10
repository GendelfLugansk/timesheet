import React, { useEffect, useState, useRef } from "react";
import deepcopy from "deepcopy";
import uuidv4 from "uuid/v4";
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
  config = defaultConfig,
  className = "Plot"
}) => {
  const p = useRef(Promise.resolve());
  const isMounted = useRef(true);
  const { i18n } = useTranslation();
  const [elId] = useState(uuidv4());

  const redraw = () => {
    p.current = p.current.then(() => {
      const plotlyConfig = deepcopy(config);
      plotlyConfig.locale = i18n.language;

      return isMounted.current
        ? Plotly.react(elId, deepcopy(data), deepcopy(layout), plotlyConfig)
        : Promise.resolve();
    });
  };

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(redraw, [elId, data, layout, config, i18n.language]);

  useEffect(() => {
    const onChange = () => {
      redraw();
    };
    const mql = window.matchMedia("print");
    mql.addEventListener("change", onChange);

    return () => {
      mql.removeEventListener("change", onChange);
    };
  });

  return (
    <div className={className}>
      <div className="PlotContainer" id={elId} />
    </div>
  );
};

export { defaultConfig, defaultLayout };

export default Plot;
