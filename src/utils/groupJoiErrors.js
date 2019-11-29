import objectPath from "object-path";

const groupJoiErrors = joiError => {
  if (joiError === null) {
    return {};
  }

  const groupedDetails = {};
  joiError.details.forEach(({ context, path, type, message }) =>
    objectPath.set(groupedDetails, path, [
      ...objectPath.get(groupedDetails, path, []),
      { context, path, type, message }
    ])
  );
  const e = new Error(joiError);
  e.groupedDetails = groupedDetails;

  return e;
};

export default groupJoiErrors;
