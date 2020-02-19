import React, { memo, useEffect } from "react";
import Plot, { defaultConfig, defaultLayout } from "../../../Plot/Plot";
import en from "./ProjectsEarningsPie.en";
import ru from "./ProjectsEarningsPie.ru";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import chartColors from "../../../../utils/chartColors";
import { shallowEqual, useSelector } from "react-redux";
import "./ProjectsEarningsPie.scss";
import uuidv4 from "uuid/v4";
import { workspaceIdSelector } from "../../../../selectors/workspaces";
import { projectsSelector } from "../../../../selectors/projects";
import Loader from "../../../Loader/Loader";
//eslint-disable-next-line import/no-webpack-loader-syntax
import worker from "workerize-loader!./worker";
import useTask, {
  CONCURRENCY_STRATEGY_RESTART
} from "../../../../hooks/useTask";
import numeral from "numeral";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const ProjectsEarningsPie = memo(({ logItems, isSyncing }) => {
  const definedProjects = useSelector(projectsSelector, shallowEqual);
  const workspaceId = useSelector(workspaceIdSelector, shallowEqual);
  const { t } = useTranslation(ns);

  const maxLegendLabelLength = 20;

  const generateRawData = useTask(
    async (logItems, workerInstance) => {
      const rawData = await workerInstance.getRawData(logItems);
      workerInstance.terminate();
      return rawData;
    },
    false,
    CONCURRENCY_STRATEGY_RESTART,
    (logItems, workerInstance, taskInstance) => {
      workerInstance.terminate();
    }
  );

  useEffect(() => {
    generateRawData.perform(logItems, worker());
  }, [generateRawData, logItems]);

  let rawData = Array.isArray(generateRawData.result)
    ? generateRawData.result
    : [];
  const total = rawData.reduce((acc, { sum }) => acc + sum, 0);
  const isOther = sum => total > 0 && sum / total <= 0.02;
  const showOthersSector = rawData.filter(({ sum }) => isOther(sum)).length > 1;
  if (showOthersSector) {
    rawData = Object.values(
      rawData.reduce((acc, { project, sum }, index) => {
        const mutAcc = { ...acc };
        const projectOrOther = isOther(sum) ? "__other__" : project;
        if (mutAcc[projectOrOther] === undefined) {
          mutAcc[projectOrOther] = {
            project: projectOrOther,
            sum: 0
          };
        }
        mutAcc[projectOrOther].sum += sum;

        return mutAcc;
      }, {})
    ).sort((a, b) => b.sum - a.sum);
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
      labels: rawData.map(({ project, sum }) => {
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
        return label + "<br>" + numeral(sum).format("$0,0.00");
      }),
      text: rawData.map(({ project, sum }) =>
        project === "__other__"
          ? t("otherCategory")
          : project !== ""
          ? project
          : t("empty")
      ),
      values: rawData.map(point => point.sum.toFixed(2)),
      type: "pie",
      hole: 0.92,
      direction: "clockwise",
      rotation: -45,
      texttemplate: "%{label} (%{percent})",
      textposition: "outside",
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
      },
      title: {
        text: t("title"),
        position: "middle center"
      }
    }
  ];

  const layout = {
    ...defaultLayout,
    margin: {
      r: 20,
      t: 60,
      b: 60,
      l: 20
    },
    showlegend: false
  };

  const config = {
    ...defaultConfig,
    displayModeBar: false
  };

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
      className="Plot ProjectsPie"
    />
  );
});

export { ProjectsEarningsPie };

export default ProjectsEarningsPie;
