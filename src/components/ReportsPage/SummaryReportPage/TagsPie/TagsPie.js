import React, { memo } from "react";
import Plot, { defaultConfig, defaultLayout } from "../../../Plot/Plot";
import en from "./TagsPie.en";
import ru from "./TagsPie.ru";
import i18n from "../../../../utils/i18n";
import { useTranslation } from "react-i18next";
import chartColors from "../../../../utils/chartColors";
import { Duration } from "luxon";
import { shallowEqual, useSelector } from "react-redux";
import { withResizeDetector } from "react-resize-detector";
import "./TagsPie.scss";
import uuidv4 from "uuid/v4";
import { workspaceIdSelector } from "../../../../selectors/workspaces";
import useRenderCounter from "../../../../hooks/useRenderCounter";
import useFilteredLog from "../../../../hooks/useFilteredLog";
import { tagsSelector } from "../../../../selectors/tags";

const ns = uuidv4();
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const TagsPie = memo(({ responsiveLegend = true, width, height }) => {
  useRenderCounter("TagsPie");
  const logItems = useFilteredLog();
  const definedTags = useSelector(tagsSelector, shallowEqual);
  const workspaceId = useSelector(workspaceIdSelector, shallowEqual);
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
      .map(({ tags, durationHours }) => ({
        tags:
          typeof tags === "string" && tags.length > 0
            ? tags
                .split(",")
                .map(v => v.trim())
                .filter(v => v.length > 0)
                .sort()
                .join("+")
            : "",
        durationHours
      }))
      .reduce((acc, { tags, durationHours }) => {
        const mutAcc = { ...acc };
        if (mutAcc[tags] === undefined) {
          mutAcc[tags] = {
            tags,
            durationHours: 0
          };
        }
        mutAcc[tags].durationHours += durationHours;

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
      rawData.reduce((acc, { tags, durationHours }, index) => {
        const mutAcc = { ...acc };
        const tagsOrOther =
          isOther(durationHours) || index >= maxSectors ? "__other__" : tags;
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
          " \u2014 " +
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
      hole: pieHole,
      direction: "clockwise",
      rotation: -45,
      textinfo: "text",
      textposition: "none",
      marker: {
        colors: rawData.map(tagsColorMapper),
        line: {
          width: borderLineWidth,
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
      className="Plot TagsPie"
    />
  );
});

export { TagsPie };

export default memo(withResizeDetector(TagsPie));
