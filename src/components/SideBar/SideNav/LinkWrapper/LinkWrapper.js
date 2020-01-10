import React, { useEffect } from "react";
import { Route } from "react-router-dom";
import { connect } from "react-redux";
import { fetchAuthStatus } from "../../../../actions/auth";

const LinkWrapper = ({
  to,
  activeClassName,
  className,
  authenticated = null,
  isAuthenticated,
  fetchState,
  children,
  ...rest
}) => {
  useEffect(fetchState, []);
  const path = typeof to === "string" ? to : to.pathname;

  if (authenticated === true && !isAuthenticated) {
    return null;
  }

  if (authenticated === false && isAuthenticated === true) {
    return null;
  }

  return (
    <Route
      {...rest}
      path={path}
      children={({ match }) => (
        <li className={className + " " + (match ? activeClassName : "")}>
          {children}
        </li>
      )}
    />
  );
};

export { LinkWrapper };

export default connect(
  state => ({
    isAuthenticated: state.auth.isAuthenticated
  }),
  dispatch => ({
    fetchState: () => {
      dispatch(fetchAuthStatus());
    }
  })
)(LinkWrapper);
