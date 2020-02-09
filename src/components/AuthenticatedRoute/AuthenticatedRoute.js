import React from "react";
import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import LoaderFullPage from "../Loader/LoaderFullPage/LoaderFullPage";

const isAuthenticatedSelector = state => state.auth.isAuthenticated;
const isLoadingSelector = state => state.auth.isLoading;

const AuthenticatedRoute = ({ redirectTo = "/login", children, ...rest }) => {
  const isAuthenticated = useSelector(isAuthenticatedSelector);
  const isLoading = useSelector(isLoadingSelector);
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

export default AuthenticatedRoute;
