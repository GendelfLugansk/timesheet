import React, { useEffect } from "react";
import { connect } from "react-redux";
import { fetchAuthStatus } from "../../actions/auth";
import { Route, Redirect } from "react-router-dom";

function UnauthenticatedRoute({
  isAuthenticated,
  fetchState,
  redirectTo = "/",
  children,
  ...rest
}) {
  if (isAuthenticated === true) {
    return (
      <Route
        {...rest}
        render={({ location }) => (
          <Redirect
            to={{
              pathname: redirectTo,
              state: { from: location }
            }}
          />
        )}
      />
    );
  }

  return <Route {...rest} render={() => children} />;
}

export { UnauthenticatedRoute };

export default connect(
  state => ({
    isAuthenticated: state.auth.isAuthenticated
  }),
  dispatch => ({
    fetchState: () => {
      dispatch(fetchAuthStatus());
    }
  })
)(UnauthenticatedRoute);
