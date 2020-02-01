import React, { useEffect } from "react";
import { connect } from "react-redux";
import { sync } from "../../../../actions/syncableStorage";
import { findMany } from "../../../../selectors/syncableStorage";

const Tags = ({ workspaceId, tags, definedTags }) => {
  return (
    <>
      {tags.map((tag, index) => {
        const definedTag = definedTags.filter(({ name }) => name === tag)[0];

        return (
          <span
            key={(definedTag && definedTag.uuid) || index}
            className="uk-label uk-margin-small-right uk-margin-small-bottom"
            style={{
              background: (definedTag && definedTag.colorRGB) || null
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
