import React, { useEffect } from "react";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";
import en from "./HomePage.en";
import ru from "./HomePage.ru";
import { connect } from "react-redux";
import { fetchWorkspaces, selectWorkspace } from "../../actions/workspaces";
import { fetchAuthStatus } from "../../actions/auth";
import LoaderFullPage from "../Loader/LoaderFullPage/LoaderFullPage";
import CreateFirstWorkspace from "./CreateFirstWorkspace/CreateFirstWorkspace";
import SelectWorkspace from "./SelectWorkspace/SelectWorkspace";

const ns = "HomePage";
i18n.addResourceBundle("en", ns, en);
i18n.addResourceBundle("ru", ns, ru);

const HomePage = ({ isLoading, workspaces, currentWorkspace, fetchState }) => {
  useEffect(fetchState, []);

  const { t } = useTranslation(ns);

  if (isLoading) {
    return <LoaderFullPage />;
  }

  if (workspaces.length === 0) {
    return <CreateFirstWorkspace />;
  }

  if (!currentWorkspace) {
    return <SelectWorkspace />;
  }

  return null;
};

export { HomePage };

export default connect(
  state => ({
    isLoading: state.auth.isLoading || state.workspaces.isLoading,
    workspaces: state.workspaces.list,
    currentWorkspace: state.workspaces.currentWorkspace
  }),
  dispatch => ({
    fetchState: () => {
      (async () => {
        await dispatch(fetchWorkspaces());
      })();
    }
  })
)(HomePage);
