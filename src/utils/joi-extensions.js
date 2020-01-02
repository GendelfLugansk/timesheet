const stringArray = function(Joi) {
  return {
    base: Joi.array(),
    name: "stringArray",
    //eslint-disable-next-line no-unused-vars
    coerce: (value, state, options) =>
      ["string", "number"].includes(typeof value)
        ? String(value)
            .split(",")
            .map(v => v.trim())
            .filter(v => v !== "")
        : value
  };
};

export { stringArray };
