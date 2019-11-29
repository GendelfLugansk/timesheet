import objectPath from "object-path";

const stringifyError = e => {
  console.log(e);

  if (typeof e === "string") {
    return e;
  }

  if (typeof objectPath.get(e, "details") === "string") {
    return objectPath.get(e, "details");
  }

  if (typeof objectPath.get(e, "error") === "string") {
    return objectPath.get(e, "error");
  }

  if (typeof objectPath.get(e, "message") === "string") {
    return objectPath.get(e, "message");
  }

  if (typeof objectPath.get(e, "error.message") === "string") {
    return objectPath.get(e, "error.message");
  }

  if (typeof objectPath.get(e, "result.error.message") === "string") {
    return objectPath.get(e, "result.error.message");
  }

  return String(e);
};

export default stringifyError;
