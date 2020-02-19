import React, { memo, useEffect } from "react";
import Plot, { defaultConfig, defaultLayout } from "../../../Plot/Plot";
import en from "./EarningsBars.en";
import ru from "./EarningsBars.ru";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import chartColors from "../../../../utils/chartColors";
import { DateTime } from "luxon";
import { shallowEqual, useSelector } from "react-redux";
import "./EarningsBars.scss";
import uuidv4 from "uuid/v4";
import { workspaceIdSelector } from "../../../../selectors/workspaces";
import { projectsSelector } from "../../../../selectors/projects";
//eslint-disable-next-line import/no-webpack-loader-syntax
import worker from "workerize-loader!./worker";
import useTask, {
  CONCURRENCY_STRATEGY_RESTART
} from "../../../../hooks/useTask";
import Loader from "../../../Loader/Loader";
import numeral from "numeral";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const EarningsBars = memo(({ logItems, isSyncing }) => {
  const definedProjects = useSelector(projectsSelector, shallowEqual);
  const workspaceId = useSelector(workspaceIdSelector, shallowEqual);
  const { t } = useTranslation(ns);

  let allProjects = [
    ...new Set(
      logItems
        .filter(({ sum }) => typeof sum === "number")
        .map(({ project }) => project)
    )
  ].sort();

  const TIMEFRAME_DAY = "day";
  const TIMEFRAME_WEEK = "week";
  const TIMEFRAME_MONTH = "month";
  const TIMEFRAME_YEAR = "year";

  let timeframe = TIMEFRAME_DAY;
  const startTimes = logItems
    .filter(({ sum }) => typeof sum === "number")
    .map(({ startTimeString }) =>
      DateTime.fromJSDate(new Date(startTimeString))
    )
    .sort((a, b) => a - b);

  if (startTimes.length > 1) {
    const periodDuration = startTimes[startTimes.length - 1].diff(
      startTimes[0]
    );
    if (periodDuration.as("days") > 21) {
      timeframe = TIMEFRAME_WEEK;
    }
    if (periodDuration.as("weeks") > 21) {
      timeframe = TIMEFRAME_MONTH;
    }
    if (periodDuration.as("months") > 21) {
      timeframe = TIMEFRAME_YEAR;
    }
  }

  const generateRawData = useTask(
    async (logItems, timeframe, workerInstance) => {
      const rawData = await workerInstance.getRawData(logItems, timeframe);
      workerInstance.terminate();
      return rawData;
    },
    false,
    CONCURRENCY_STRATEGY_RESTART,
    (logItems, timeframe, workerInstance, taskInstance) => {
      workerInstance.terminate();
    }
  );

  useEffect(() => {
    generateRawData.perform(logItems, timeframe, worker());
  }, [generateRawData, logItems, timeframe]);

  const rawData = Array.isArray(generateRawData.result)
    ? generateRawData.result
    : [];

  const projectColorMapper = project => {
    const definedProject =
      definedProjects.filter(
        ({ name, colorRGB }) =>
          name === project &&
          typeof colorRGB === "string" &&
          colorRGB.length > 0
      )[0] || {};

    return (
      definedProject.colorRGB ||
      chartColors.getColor(workspaceId + "_project", project)
    );
  };

  const data = [
    {
      name: t("total_" + timeframe),
      x: rawData.map(({ date }) => date),
      y: rawData.map(({ sum }) => sum),
      text: rawData.map(({ sum }) =>
        sum > 999999
          ? numeral(sum / 1000000).format("$0,0.00") + "m"
          : sum > 999
          ? numeral(sum / 1000).format("$0,0.00") + "k"
          : numeral(sum).format("$0,0.00")
      ),
      hovertext: rawData.map(({ sum }) => numeral(sum).format("$0,0.00")),
      type: "scatter",
      mode: "text",
      textposition: "top center",
      hovertemplate:
        "%{x}<br>%{fullData.name} \u2014 %{hovertext}<extra></extra>",
      hoverlabel: {
        bgcolor: "#fff",
        bordercolor: "#000000",
        font: {
          color: "#333"
        }
      },
      cliponaxis: false,
      marker: {
        color: "#000000",
        symbol: "triangle-up"
      },
      showlegend: false
    }
  ].concat(
    allProjects.map(project => {
      const filteredData = rawData.filter(
        ({ projects }) =>
          projects[project] !== undefined && projects[project].sum !== 0
      );

      return {
        name: project !== "" ? project : t("empty"),
        x: filteredData.map(({ date }) => date),
        y: filteredData.map(({ projects }) =>
          ((projects[project] || {}).sum || 0).toFixed(2)
        ),
        text: filteredData.map(({ projects }) =>
          numeral((projects[project] || {}).sum || 0).format("$0,0.00")
        ),
        type: "bar",
        hoverinfo: "x+name+text",
        hovertemplate: "%{x}<br>%{fullData.name} \u2014 %{text}<extra></extra>",
        textposition: "none",
        insidetextanchor: "middle",
        marker: {
          color: projectColorMapper(project),
          line: {
            width: 1,
            color: "rgba(255, 255, 255, 1)"
          }
        },
        hoverlabel: {
          bgcolor: "#fff",
          bordercolor: projectColorMapper(project),
          font: {
            color: "#333"
          }
        }
      };
    })
  );

  const layout = {
    ...defaultLayout,
    margin: {
      r: 20,
      t: 40,
      b: 50,
      l: 50
    },
    title: t("title_" + timeframe),
    showlegend: true,
    legend: {
      itemclick: false,
      itemdoubleclick: false,
      orientation: "h",
      y: -0.2,
      yanchor: "top",
      title: {
        text: t("legendTitle"),
        side: "top"
      }
    },
    barmode: "stack",
    xaxis: {
      showspikes: false,
      spikethickness: 1,
      spikemode: "across",
      title: t("xTitle_" + timeframe),
      tickformat: (timeframe => {
        switch (timeframe) {
          default:
          case TIMEFRAME_DAY:
          case TIMEFRAME_WEEK:
            return "%Y-%m-%d";

          case TIMEFRAME_MONTH:
            return "%Y, %B";

          case TIMEFRAME_YEAR:
            return "%Y";
        }
      })(timeframe)
    },
    yaxis: {
      showspikes: false,
      spikethickness: 1,
      spikemode: "across",
      title: t("yTitle")
    },
    shapes: [
      {
        type: "line",
        xref: "paper",
        yref: "y",
        x0: 0,
        y0: 0,
        x1: 1,
        y1: 0,
        line: {
          width: 1
        }
      }
    ],
    hovermode: "closest"
  };

  const config = {
    ...defaultConfig
  };

  useEffect(() => {
    //Stupid Plotly does not render chart properly on first page load
    window.dispatchEvent(new Event("resize"));
  }, []);

  if ((generateRawData.isRunning || isSyncing) && rawData.length === 0) {
    return (
      <div className="uk-width-1-1 uk-height-1-1 uk-position-relative uk-flex uk-flex-middle uk-flex-center uk-background-muted">
        <div>
          <Loader />
        </div>
      </div>
    );
  }

  if (rawData.length === 0) {
    return (
      <div className="uk-width-1-1 uk-height-1-1 uk-flex uk-flex-middle uk-flex-center uk-background-muted uk-padding-small">
        <div>{t("noData")}</div>
      </div>
    );
  }

  return (
    <Plot
      data={data}
      layout={layout}
      config={config}
      className="Plot TimeBars"
    />
  );
});

export default EarningsBars;
