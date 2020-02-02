import CurrentUser from "./CurrentUser/CurrentUser";
import React from "react";
import "./SideBar.scss";
import LocaleChanger from "./LocaleChanger/LocaleChanger";
import SideNav from "./SideNav/SideNav";
import Logo from "./Logo/Logo";
import WorkspaceSelector from "./WorkspaceSelector/WorkspaceSelector";
import AuthenticatedContainer from "../AuthenticatedContainer/AuthenticatedContainer";

const SideBar = () => {
  return (
    <div className="uk-padding-small uk-light uk-background-secondary uk-flex uk-flex-column SideBar">
      <Logo />
      <hr />
      <CurrentUser />
      <AuthenticatedContainer>
        <WorkspaceSelector />
        <hr />
      </AuthenticatedContainer>
      <SideNav />
      <hr />
      <LocaleChanger />
    </div>
  );
};
export { SideBar };
export default SideBar;
