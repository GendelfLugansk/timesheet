import React, { memo } from "react";
import { shallowEqual, useSelector } from "react-redux";
import Color from "color";
import { tagsSelector } from "../../../../selectors/tags";

const Tags = memo(({ tags }) => {
  const definedTags = useSelector(tagsSelector, shallowEqual);

  return (
    <>
      {tags.map((tag, index) => {
        const definedTag = definedTags.filter(({ name }) => name === tag)[0];
        const backgroundColor = Color(
          (definedTag && definedTag.colorRGB) || "#1e87f0"
        );
        const lightText = Color("#ffffff"),
          darkText = Color("#333333");
        const textColor =
          backgroundColor.contrast(lightText) >
          backgroundColor.contrast(darkText)
            ? lightText
            : darkText;

        return (
          <span
            key={(definedTag && definedTag.uuid) || index}
            className="uk-label uk-margin-small-right uk-margin-small-bottom"
            style={{
              background: backgroundColor.rgb().string(),
              color: textColor.rgb().string()
            }}
          >
            {tag}
          </span>
        );
      })}
    </>
  );
});

export { Tags };

export default Tags;
