const stringifyError = e => {
  console.log(e);

  if (typeof e === "string") {
    return e;
  }

  if (typeof e.details === "string") {
    return e.details;
  }

  if (typeof e.error === "string") {
    return e.error;
  }

  if (typeof e.message === "string") {
    return e.message;
  }

  if (
    typeof e.error === "object" &&
    e.error !== null &&
    typeof e.error.message === "string"
  ) {
    return e.error.message;
  }

  return String(e);
};

export default stringifyError;
