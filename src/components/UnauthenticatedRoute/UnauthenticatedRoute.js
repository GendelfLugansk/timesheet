import React from "react";
import { connect } from "react-redux";
import { Route, Redirect } from "react-router-dom";

function UnauthenticatedRoute({
  isAuthenticated,
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

export default connect(state => ({
  isAuthenticated: state.auth.isAuthenticated
}))(UnauthenticatedRoute);
