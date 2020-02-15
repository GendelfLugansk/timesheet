import React, { useState, useCallback, useRef } from "react";
import Logo from "../Logo/Logo";
import CurrentUser from "../CurrentUser/CurrentUser";
import AuthenticatedContainer from "../../AuthenticatedContainer/AuthenticatedContainer";
import WorkspaceSelector from "../WorkspaceSelector/WorkspaceSelector";
import SideNav from "../SideNav/SideNav";
import LocaleChanger from "../LocaleChanger/LocaleChanger";
import OffCanvas from "../../UIKit/OffCanvas/OffCanvas";

const MobileSideBar = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const open = useCallback(() => {
    setSidebarVisible(true);
  }, []);

  const events = useRef({
    beforehide: () => {
      setSidebarVisible(false);
    }
  });

  return (
    <div className="uk-width-1-1 uk-hidden@l unprintable">
      <nav className="uk-navbar uk-navbar-container">
        <div className="uk-navbar-left">
          <button className="uk-navbar-toggle" onClick={open}>
            <span uk-icon="menu" />
          </button>
        </div>
        <div className="uk-navbar-center">
          <Logo dark={true} />
        </div>
      </nav>
      <OffCanvas show={sidebarVisible} events={events.current}>
        <button className="uk-offcanvas-close" type="button" uk-close="true" />

        <CurrentUser />
        <AuthenticatedContainer>
          <WorkspaceSelector />
          <hr />
        </AuthenticatedContainer>
        <SideNav />
        <hr />
        <LocaleChanger />
      </OffCanvas>
    </div>
  );
};

export default MobileSideBar;
