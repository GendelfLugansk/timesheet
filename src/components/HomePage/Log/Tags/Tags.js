import React, { useEffect } from "react";
import { connect } from "react-redux";
import objectPath from "object-path";
import { sync } from "../../../../actions/syncableStorage";

const Tags = ({ tags, definedTags, fetchState }) => {
  const maybeFetch = () => {
    if (definedTags.length === 0) {
      fetchState();
    }
  };
  useEffect(maybeFetch, []);

  return (
    <>
      {tags.map((tag, index) => {
        const definedTag = definedTags.filter(({ name }) => name === tag)[0];

        if (definedTag && definedTag.colorRGB) {
          return (
            <span
              key={definedTag.uuid || index}
              className="uk-label uk-margin-small-right"
              style={{ background: definedTag.colorRGB }}
            >
              {tag}
            </span>
          );
        }

        return (
          <span key={index} className="uk-label uk-margin-small-right">
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
    definedTags: objectPath.get(
      state.syncableStorage,
      `${workspaceId}.Tags.data`,
      []
    )
  }),
  (dispatch, { workspaceId }) => ({
    fetchState: () => {
      dispatch(sync(workspaceId, "Tags"));
    }
  })
)(Tags);
