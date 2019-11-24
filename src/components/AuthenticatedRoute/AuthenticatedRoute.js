import React, { useEffect } from "react";
import { connect } from "react-redux";
import { fetchAuthStatus } from "../../actions/auth";
import { Route, Redirect } from "react-router-dom";
import "./AuthenticatedRoute.scss";

const AuthenticatedRoute = ({
  isAuthenticated,
  isLoading,
  authFetchError,
  fetchState,
  redirectTo = "/login",
  children,
  ...rest
}) => {
  useEffect(fetchState, []);

  if (isAuthenticated === true) {
    return <Route {...rest} render={() => children} />;
  }

  if (!isAuthenticated && authFetchError) {
    return (
      <div className="uk-flex uk-flex-center uk-flex-middle AuthenticatedRouteSpinnerContainer">
        <div className="uk-alert-danger" uk-alert="true">
          {authFetchError}
        </div>
      </div>
    );
  }

  if (isLoading === true || isAuthenticated === undefined) {
    return (
      <div className="uk-flex uk-flex-center uk-flex-middle AuthenticatedRouteSpinnerContainer">
        <div>
          <div uk-spinner="ratio: 3" />
        </div>
      </div>
    );
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

export default connect(
  state => ({
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
    authFetchError: state.auth.error
  }),
  dispatch => ({
    fetchState: () => {
      dispatch(fetchAuthStatus());
    }
  })
)(AuthenticatedRoute);
