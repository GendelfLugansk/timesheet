import React, { useEffect } from "react";
import { connect } from "react-redux";
import { sync } from "../../../../actions/syncableStorage";
import { findMany } from "../../../../selectors/syncableStorage";
import Color from "color";

const Tags = ({ workspaceId, tags, definedTags }) => {
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

export default connect(
  (state, { workspaceId }) => ({
    definedTags: findMany(state, workspaceId, "Tags")
  }),
  (dispatch, { workspaceId }) => ({
    fetchState: () => {
      dispatch(sync(workspaceId, ["Tags"]));
    }
  })
)(Tags);
