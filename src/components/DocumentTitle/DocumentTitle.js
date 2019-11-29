import React, { useEffect, useState } from "react";
const titles = [],
  formatters = [];

const push = (titleIndex, title, formatter) => {
  titles[titleIndex] = title;
  formatters[titleIndex] = formatter;
};

const remove = titleIndex => {
  if (titles.length > titleIndex && titleIndex >= 0) {
    titles.splice(titleIndex);
    formatters.splice(titleIndex);
  }
};

const setTitle = titleIndex => {
  if (titles.length > titleIndex && titleIndex >= 0) {
    window.document.title = formatters[titleIndex](titles[titleIndex], titles);
  }
};

const DocumentTitle = ({
  title,
  formatter = (title, titles) => titles.join(" :: ")
}) => {
  const [titleIndex, setTitleIndex] = useState();

  useEffect(() => {
    //This hook fires only on first render
    const titleIndex = titles.length;
    setTitleIndex(titleIndex);
    push(titleIndex, title, formatter);
    setTitle(titleIndex);

    return () => {
      remove(titleIndex);
      setTitle(titleIndex - 1);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    //This fires on every render but should not be on first one, so we check state
    if (typeof titleIndex === "number") {
      push(titleIndex, title, formatter);
      setTitle(titleIndex);
    }
  });

  return <></>;
};

export default DocumentTitle;
