import React from "react";
import { Route } from "react-router-dom";
import { useSelector } from "react-redux";

const selector = state => state.auth.isAuthenticated;

const LinkWrapper = ({
  to,
  activeClassName,
  className,
  authenticated = null,
  children,
  ...rest
}) => {
  const isAuthenticated = useSelector(selector);
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

export default LinkWrapper;
