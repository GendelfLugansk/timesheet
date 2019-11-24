import Auth from "../Auth/Auth";
import LinkWrapper from "./LinkWrapper";
import { Link } from "react-router-dom";
import React from "react";
import "./SideNav.scss";

const SideNav = () => {
  return (
    <div className="uk-padding-small uk-light uk-background-secondary SideNav">
      <Auth />
      <ul className="uk-nav uk-nav-default">
        <LinkWrapper
          exact
          authenticated={true}
          to="/"
          activeClassName="uk-active"
        >
          <Link to="/">Home</Link>
        </LinkWrapper>
        <LinkWrapper to="/about" activeClassName="uk-active">
          <Link to="/about">About</Link>
        </LinkWrapper>
        <LinkWrapper
          authenticated={false}
          to="/login"
          activeClassName="uk-active"
        >
          <Link to="/login">Login</Link>
        </LinkWrapper>
      </ul>
    </div>
  );
};
export { SideNav };
export default SideNav;
