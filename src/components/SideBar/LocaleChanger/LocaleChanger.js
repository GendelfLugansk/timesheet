import React from "react";
import { supportedLocales, getLocaleInfo } from "../../../i18n";
import { useTranslation } from "react-i18next";
import "./LocaleChanger.scss";
import "flag-icon-css/css/flag-icon.css";

const LocaleChanger = () => {
  const { i18n } = useTranslation();

  return (
    <div className="uk-text-center LocaleChanger">
      <div className="uk-inline uk-width-1-1">
        <button
          className="uk-button uk-button-link uk-button-small uk-width-1-1"
          type="button"
        >
          <span
            className={`flag-icon flag-icon-${
              getLocaleInfo(i18n.language).flag
            } uk-margin-small-right`}
          />
          {getLocaleInfo(i18n.language).name}
        </button>
        <div uk-dropdown="pos: bottom-justify; mode: click">
          <ul className="uk-nav uk-dropdown-nav">
            {supportedLocales.map(locale => (
              <li
                className={locale === i18n.language ? "uk-active" : null}
                key={locale}
              >
                <button
                  className="button-link"
                  onClick={() => i18n.changeLanguage(locale)}
                >
                  <span
                    className={`flag-icon flag-icon-${
                      getLocaleInfo(locale).flag
                    } uk-margin-small-right`}
                  />
                  {getLocaleInfo(locale).name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LocaleChanger;
