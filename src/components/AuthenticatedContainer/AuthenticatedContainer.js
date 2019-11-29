import React, { useEffect } from "react";
import { connect } from "react-redux";
import { fetchAuthStatus } from "../../actions/auth";

const AuthenticatedContainer = ({
  isAuthenticated,
  fetchState,
  children,
  ...rest
}) => {
  useEffect(fetchState, []);

  if (isAuthenticated === true) {
    return <>{children}</>;
  }

  return null;
};

export { AuthenticatedContainer };

export default connect(
  state => ({
    isAuthenticated: state.auth.isAuthenticated
  }),
  dispatch => ({
    fetchState: () => {
      dispatch(fetchAuthStatus());
    }
  })
)(AuthenticatedContainer);
