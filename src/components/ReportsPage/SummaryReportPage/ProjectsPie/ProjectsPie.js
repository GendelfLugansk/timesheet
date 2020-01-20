import React, { useEffect } from "react";
import Plot, { defaultConfig, defaultLayout } from "../../../Plot/Plot";
import en from "./ProjectsPie.en";
import ru from "./ProjectsPie.ru";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import chartColors from "../../../../utils/chartColors";
import { Duration } from "luxon";
import { connect } from "react-redux";
import objectPath from "object-path";
import { sync } from "../../../../actions/syncableStorage";

const ns = "ProjectsPie";
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const ProjectsPie = ({ workspaceId, logItems, definedProjects = [] }) => {
  const { t } = useTranslation(ns);

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
  const maxSectors = 10;

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
        const maxLength = 10,
          leeway = 3;
        if (label.length > maxLength + leeway) {
          label = label.substr(0, maxLength) + "...";
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
      hole: 0.95,
      direction: "clockwise",
      rotation: -45,
      textinfo: "text",
      textposition: "none",
      marker: {
        colors: rawData.map(projectColorMapper),
        line: {
          width: 2,
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
    height: 400,
    margin: {
      r: 20,
      t: 20,
      b: 20,
      l: 20
    },
    legend: {
      x: 0.5,
      xanchor: "center",
      y: 0.5,
      yanchor: "middle",
      itemclick: false,
      itemdoubleclick: false,
      title: {
        text: t("title"),
        side: "top",
        font: {
          size: 13
        }
      },
      font: {
        size: 12
      }
    }
  };

  const config = {
    ...defaultConfig,
    displayModeBar: false
  };

  return <Plot data={data} layout={layout} config={config} />;
};

export { ProjectsPie };

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
)(({ workspaceId, logItems, definedProjects, fetchState }) => {
  useEffect(fetchState, [workspaceId]);

  return (
    <ProjectsPie
      workspaceId={workspaceId}
      logItems={logItems}
      definedProjects={definedProjects}
    />
  );
});
