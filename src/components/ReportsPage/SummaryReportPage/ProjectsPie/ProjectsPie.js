import React from "react";
import Plot, { defaultConfig, defaultLayout } from "../../../Plot/Plot";
import en from "./ProjectsPie.en";
import ru from "./ProjectsPie.ru";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import chartColors from "../../../../utils/chartColors";
import { Duration } from "luxon";
import { connect } from "react-redux";
import ReactResizeDetector from "react-resize-detector";
import "./ProjectsPie.scss";
import uuidv4 from "uuid/v4";
import { findMany } from "../../../../selectors/syncableStorage";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const ProjectsPie = ({
  workspaceId,
  logItems,
  definedProjects = [],
  responsiveLegend = true,
  width,
  height
}) => {
  const { t } = useTranslation(ns);

  //These weird calculations below try to detect best parameters for legend display
  //Legend displayed starting from 200x200
  const diameter = Math.min(width, height);
  let legendSize,
    maxSectors = 3,
    maxLegendLabelLength = 6;
  let legendTitleFontSize = 10;
  let legendItemFontSize = 8;
  const pieHole = 0.95;
  let padding = 10;
  const borderLineWidth = 2;
  let longLegendTitle = false,
    showlegend = false;
  if (responsiveLegend) {
    if (!isNaN(diameter)) {
      if (diameter >= 200) {
        showlegend = true;
      }
      if (diameter > 250) {
        legendTitleFontSize = 12;
        legendItemFontSize = 11;
      }
      if (diameter >= 250) {
        padding = 15;
      }
      if (diameter >= 300) {
        longLegendTitle = true;
      }
      if (diameter > 350) {
        legendTitleFontSize = 13;
        legendItemFontSize = 12;
      }
      if (diameter >= 350) {
        padding = 20;
      }
      legendSize =
        ((diameter - padding * 2) * pieHole - borderLineWidth * 4) /
        Math.sqrt(2);
      maxSectors =
        Math.floor(
          (legendSize - legendTitleFontSize * 1.5 + legendTitleFontSize) /
            Math.max(legendItemFontSize * 1.6, 19)
        ) - 1;
      maxLegendLabelLength = Math.floor(
        legendSize / ((3 * legendItemFontSize) / 1.5)
      );
    }
  } else {
    showlegend = true;
    longLegendTitle = true;
    legendTitleFontSize = 13;
    legendItemFontSize = 12;
    padding = 20;
    maxSectors = 10;
    maxLegendLabelLength = 10;
  }

  let rawData = Object.values(
    logItems
      .filter(({ durationHours }) => typeof durationHours === "number")
      .map(({ project, durationHours }) => ({
        project,
        durationHours
      }))
      .reduce((acc, { project, durationHours }) => {
        const mutAcc = { ...acc };
        if (mutAcc[project] === undefined) {
          mutAcc[project] = {
            project,
            durationHours: 0
          };
        }
        mutAcc[project].durationHours += durationHours;

        return mutAcc;
      }, {})
  ).sort((a, b) => b.durationHours - a.durationHours);

  const total = rawData.reduce(
    (sum, { durationHours }) => sum + durationHours,
    0
  );
  const isOther = durationHours =>
    total > 0 && durationHours / total <= 0.000000000002;
  const showOthersSector =
    rawData.filter(({ durationHours }) => isOther(durationHours)).length > 1;
  if (showOthersSector || rawData.length > maxSectors) {
    rawData = Object.values(
      rawData.reduce((acc, { project, durationHours }, index) => {
        const mutAcc = { ...acc };
        const projectOrOther =
          isOther(durationHours) || index >= maxSectors ? "__other__" : project;
        if (mutAcc[projectOrOther] === undefined) {
          mutAcc[projectOrOther] = {
            project: projectOrOther,
            durationHours: 0
          };
        }
        mutAcc[projectOrOther].durationHours += durationHours;

        return mutAcc;
      }, {})
    ).sort((a, b) => b.durationHours - a.durationHours);
  }

  const projectColorMapper = ({ project }) => {
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
      labels: rawData.map(({ project, durationHours }) => {
        let label =
          project === "__other__"
            ? t("otherCategory")
            : project !== ""
            ? project
            : t("empty");
        const leeway = 3;
        if (label.length > maxLegendLabelLength + leeway) {
          label = label.substr(0, maxLegendLabelLength) + "...";
        }
        return (
          label +
          " \u2014 " +
          Duration.fromObject({ hours: durationHours }).toFormat("hh:mm:ss")
        );
      }),
      text: rawData.map(({ project, durationHours }) =>
        project === "__other__"
          ? t("otherCategory")
          : project !== ""
          ? project
          : t("empty")
      ),
      values: rawData.map(point => point.durationHours.toFixed(2)),
      type: "pie",
      hole: pieHole,
      direction: "clockwise",
      rotation: -45,
      textinfo: "text",
      textposition: "none",
      marker: {
        colors: rawData.map(projectColorMapper),
        line: {
          width: borderLineWidth,
          color: "rgba(255, 255, 255, 1)"
        }
      },
      hoverinfo: "text+percent+value",
      hoverlabel: {
        bgcolor: "#fff",
        bordercolor: rawData.map(projectColorMapper),
        font: {
          color: "#333"
        }
      }
    }
  ];

  const layout = {
    ...defaultLayout,
    margin: {
      r: padding,
      t: padding,
      b: padding,
      l: padding
    },
    showlegend,
    legend: {
      x: 0.5,
      xanchor: "center",
      y: 0.5,
      yanchor: "middle",
      itemclick: false,
      itemdoubleclick: false,
      title: {
        text: longLegendTitle ? t("title") : t("titleShort"),
        side: "top",
        font: {
          size: legendTitleFontSize
        }
      },
      font: {
        size: legendItemFontSize
      }
    }
  };

  const config = {
    ...defaultConfig,
    displayModeBar: false
  };

  return (
    <Plot
      data={data}
      layout={layout}
      config={config}
      className="Plot ProjectsPie"
    />
  );
};

export { ProjectsPie };

export default connect((state, { workspaceId }) => ({
  definedProjects: findMany(state, workspaceId, "Projects")
}))(({ workspaceId, fetchState, ...rest }) => {
  return (
    <ReactResizeDetector handleWidth handleHeight>
      <ProjectsPie workspaceId={workspaceId} {...rest} />
    </ReactResizeDetector>
  );
});
