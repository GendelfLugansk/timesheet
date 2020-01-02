import objectPath from "object-path";

const groupJoiErrors = joiError => {
  if (joiError === null) {
    return {};
  }

  const groupedDetails = {};
  joiError.details.forEach(({ context, path, type, message }) =>
    objectPath.set(groupedDetails, path[0], [
      ...objectPath.get(groupedDetails, path[0], []),
      { context, path, type, message }
    ])
  );
  const e = new Error(joiError);
  e.groupedDetails = groupedDetails;

  return e;
};

export default groupJoiErrors;
