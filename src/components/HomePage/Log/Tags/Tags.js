import React from "react";
import { connect } from "react-redux";
import { findMany } from "../../../../selectors/syncableStorage";
import Color from "color";

const Tags = ({ tags, definedTags }) => {
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
};

export { Tags };

export default connect(state => ({
  definedTags: findMany(state, "Tags")
}))(Tags);
