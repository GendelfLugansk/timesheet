import React from "react";
import { useSelector } from "react-redux";

const selector = state => state.auth.isAuthenticated;

const AuthenticatedContainer = ({ children }) => {
  const isAuthenticated = useSelector(selector);
  if (isAuthenticated === true) {
    return <>{children}</>;
  }

  return null;
};

export { AuthenticatedContainer };

export default AuthenticatedContainer;
