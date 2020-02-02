import React from "react";
import { connect } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import LoaderFullPage from "../Loader/LoaderFullPage/LoaderFullPage";

const AuthenticatedRoute = ({
  isAuthenticated,
  isLoading,
  redirectTo = "/login",
  children,
  ...rest
}) => {
  if (isAuthenticated === true) {
    return <Route {...rest} render={() => children} />;
  }

  if (isLoading === true || isAuthenticated === undefined) {
    return <LoaderFullPage />;
  }

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
};

export { AuthenticatedRoute };

export default connect(state => ({
  isAuthenticated: state.auth.isAuthenticated,
  isLoading: state.auth.isLoading
}))(AuthenticatedRoute);
