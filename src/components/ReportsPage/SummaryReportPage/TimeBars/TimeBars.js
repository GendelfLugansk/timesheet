import React, { useEffect } from "react";
import Plot, { defaultConfig, defaultLayout } from "../../../Plot/Plot";
import en from "./TimeBars.en";
import ru from "./TimeBars.ru";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import chartColors from "../../../../utils/chartColors";
import { DateTime, Duration } from "luxon";
import { connect } from "react-redux";
import objectPath from "object-path";
import { sync } from "../../../../actions/syncableStorage";
import ReactResizeDetector from "react-resize-detector";
import "./TimeBars.scss";

const ns = "TimeBars";
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const TimeBars = ({
  workspaceId,
  logItems,
  definedProjects = [],
  responsiveLegend = true,
  width,
  height
}) => {
  const { t } = useTranslation(ns);

  let allProjects = [
    ...new Set(
      logItems
        .filter(({ durationHours }) => typeof durationHours === "number")
        .map(({ project }) => project)
    )
  ].sort();

  let rawData = Object.values(
    logItems
      .filter(({ durationHours }) => typeof durationHours === "number")
      .map(({ project, startTimeString, durationHours }) => ({
        project,
        date: DateTime.fromISO(startTimeString)
          .toLocal()
          .startOf("day"),
        durationHours
      }))
      .reduce((acc, { project, date, durationHours }) => {
        const mutAcc = { ...acc };
        const key = date.toISO();
        if (mutAcc[key] === undefined) {
          mutAcc[key] = {
            date,
            durationHours: 0,
            projects: {}
          };
        }
        if (mutAcc[key].projects[project] === undefined) {
          mutAcc[key].projects[project] = {
            durationHours: 0
          };
        }
        mutAcc[key].durationHours += durationHours;
        mutAcc[key].projects[project].durationHours += durationHours;

        return mutAcc;
      }, {})
  ).sort((a, b) => a.date - b.date);

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
      name: t("total"),
      x: rawData.map(({ date }) => date.toJSDate()),
      y: rawData.map(({ durationHours }) => durationHours),
      text: rawData.map(({ durationHours }) =>
        Duration.fromObject({
          hours: durationHours
        }).toFormat("hh:mm:ss")
      ),
      type: "scatter",
      mode: "text",
      textposition: "top center",
      hovertemplate: "%{x}<br>%{fullData.name} \u2014 %{text}<extra></extra>",
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
      }
    }
  ].concat(
    allProjects.map(project => {
      const filteredData = rawData.filter(
        ({ projects }) =>
          projects[project] !== undefined &&
          projects[project].durationHours !== 0
      );

      return {
        name: project !== "" ? project : t("empty"),
        x: filteredData.map(({ date }) => date.toJSDate()),
        y: filteredData.map(({ projects }) =>
          ((projects[project] || {}).durationHours || 0).toFixed(2)
        ),
        text: filteredData.map(({ projects }) =>
          Duration.fromObject({
            hours: (projects[project] || {}).durationHours || 0
          }).toFormat("hh:mm:ss")
        ),
        type: "bar",
        hoverinfo: "x+name+text",
        hovertemplate: "%{x}<br>%{fullData.name} \u2014 %{text}<extra></extra>",
        textposition: "inside",
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
      l: 40
    },
    showlegend: true,
    legend: {
      itemclick: false,
      itemdoubleclick: false,
      orientation: "h",
      y: -0.7,
      yanchor: "top",
      title: {
        text: t("legendTitle"),
        side: "top"
      }
    },
    barmode: "stack",
    xaxis: {
      rangeslider: {
        visible: true
      },
      showspikes: false,
      spikethickness: 1,
      spikemode: "across",
      title: t("xTitle")
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
    ]
  };

  if (
    rawData.length > 0 &&
    rawData[rawData.length - 1].date.diff(rawData[0].date).as("days") > 14
  ) {
    layout.xaxis.range = [
      rawData[rawData.length - 1].date
        .minus({ days: 14, hours: 12 })
        .toJSDate(),
      rawData[rawData.length - 1].date.plus({ hours: 12 }).toJSDate()
    ];
    layout.xaxis.autorange = false;
  }

  const config = {
    ...defaultConfig
  };

  return (
    <Plot
      data={data}
      layout={layout}
      config={config}
      className="Plot TimeBars"
    />
  );
};

export { TimeBars };

export default connect(
  (state, { workspaceId }) => ({
    definedProjects: objectPath.get(
      state.syncableStorage,
      `${workspaceId}.Projects.data`,
      []
    )
  }),
  (dispatch, { workspaceId }) => ({
    fetchState: () => {
      dispatch(sync(workspaceId, "Projects"));
    }
  })
)(({ workspaceId, fetchState, ...rest }) => {
  useEffect(fetchState, [workspaceId]);

  return (
    <ReactResizeDetector handleWidth handleHeight>
      <TimeBars workspaceId={workspaceId} {...rest} />
    </ReactResizeDetector>
  );
});
