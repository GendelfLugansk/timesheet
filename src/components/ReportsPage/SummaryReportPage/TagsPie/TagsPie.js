import React, { memo, useEffect } from "react";
import Plot, { defaultConfig, defaultLayout } from "../../../Plot/Plot";
import en from "./TagsPie.en";
import ru from "./TagsPie.ru";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import chartColors from "../../../../utils/chartColors";
import { Duration } from "luxon";
import { shallowEqual, useSelector } from "react-redux";
import "./TagsPie.scss";
import uuidv4 from "uuid/v4";
import { workspaceIdSelector } from "../../../../selectors/workspaces";
import { tagsSelector } from "../../../../selectors/tags";
import Loader from "../../../Loader/Loader";
import useTask, {
  CONCURRENCY_STRATEGY_RESTART
} from "../../../../hooks/useTask";
//eslint-disable-next-line import/no-webpack-loader-syntax
import worker from "workerize-loader!./worker";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const TagsPie = memo(({ logItems, isSyncing }) => {
  const definedTags = useSelector(tagsSelector, shallowEqual);
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

  const total = rawData.reduce(
    (sum, { durationHours }) => sum + durationHours,
    0
  );
  const isOther = durationHours => total > 0 && durationHours / total <= 0.02;
  const showOthersSector =
    rawData.filter(({ durationHours }) => isOther(durationHours)).length > 1;

  if (showOthersSector) {
    rawData = Object.values(
      rawData.reduce((acc, { tags, durationHours }, index) => {
        const mutAcc = { ...acc };
        const tagsOrOther = isOther(durationHours) ? "__other__" : tags;
        if (mutAcc[tagsOrOther] === undefined) {
          mutAcc[tagsOrOther] = {
            tags: tagsOrOther,
            durationHours: 0
          };
        }
        mutAcc[tagsOrOther].durationHours += durationHours;

        return mutAcc;
      }, {})
    ).sort((a, b) => b.durationHours - a.durationHours);
  }

  const tagsColorMapper = ({ tags }) => {
    const definedTag =
      definedTags.filter(
        ({ name, colorRGB }) =>
          name === tags && typeof colorRGB === "string" && colorRGB.length > 0
      )[0] || {};

    return (
      definedTag.colorRGB ||
      chartColors.getColor(workspaceId + "_tags_combined", tags)
    );
  };

  const data = [
    {
      labels: rawData.map(({ tags, durationHours }) => {
        let label =
          tags === "__other__"
            ? t("otherCategory")
            : tags !== ""
            ? tags
            : t("empty");
        const leeway = 3;
        if (label.length > maxLegendLabelLength + leeway) {
          label = label.substr(0, maxLegendLabelLength) + "...";
        }
        return (
          label +
          "<br>" +
          Duration.fromObject({ hours: durationHours }).toFormat("hh:mm:ss")
        );
      }),
      text: rawData.map(({ tags, durationHours }) =>
        tags === "__other__"
          ? t("otherCategory")
          : tags !== ""
          ? tags
          : t("empty")
      ),
      values: rawData.map(point => point.durationHours.toFixed(2)),
      type: "pie",
      hole: 0.92,
      direction: "clockwise",
      rotation: -45,
      textinfo: "label",
      textposition: "outside",
      marker: {
        colors: rawData.map(tagsColorMapper),
        line: {
          width: 2,
          color: "rgba(255, 255, 255, 1)"
        }
      },
      hoverinfo: "text+percent+value",
      hoverlabel: {
        bgcolor: "#fff",
        bordercolor: rawData.map(tagsColorMapper),
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
      className="Plot TagsPie"
    />
  );
});

export { TagsPie };

export default TagsPie;
