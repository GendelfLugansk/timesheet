import React from "react";
import { connect } from "react-redux";

const AuthenticatedContainer = ({ isAuthenticated, children }) => {
  if (isAuthenticated === true) {
    return <>{children}</>;
  }

  return null;
};

export { AuthenticatedContainer };

export default connect(state => ({
  isAuthenticated: state.auth.isAuthenticated
}))(AuthenticatedContainer);
