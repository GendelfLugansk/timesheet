const SET_FILTERS = "SET_FILTERS";

const setFilters = filters => ({
  type: SET_FILTERS,
  payload: { filters }
});

export { SET_FILTERS, setFilters };
