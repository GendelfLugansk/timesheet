import React, { useEffect } from "react";
import { connect } from "react-redux";
import { fetchAuthStatus } from "../../actions/auth";
import { Route, Redirect } from "react-router-dom";
import LoaderFullPage from "../Loader/LoaderFullPage/LoaderFullPage";
import stringifyError from "../../utils/stringifyError";

const AuthenticatedRoute = ({
  isAuthenticated,
  isLoading,
  authFetchError,
  fetchState,
  redirectTo = "/login",
  children,
  ...rest
}) => {
  if (isAuthenticated === true) {
    return <Route {...rest} render={() => children} />;
  }

  if (!isAuthenticated && authFetchError) {
    return (
      <div className="uk-flex uk-flex-center uk-flex-middle min-height-100">
        <div className="uk-width-1-1 uk-width-2-3@m uk-width-1-2@l">
          <div className="uk-alert-danger" uk-alert="true">
            {stringifyError(authFetchError)}
          </div>
        </div>
      </div>
    );
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
