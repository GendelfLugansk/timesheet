import React, { useEffect, useState, useRef } from "react";
import uuidv4 from "uuid/v4";
/*global UIkit*/

const defaultOptions = {
  escClose: false,
  bgClose: false
};

const Modal = ({ show = false, options = {}, events = {}, children }) => {
  const [elId] = useState("__element__" + uuidv4());
  const UIKitComponent = useRef(undefined);

  useEffect(() => {
    UIKitComponent.current = UIkit.modal(document.getElementById(elId));

    return () => {
      if (UIKitComponent.current) {
        UIKitComponent.current.$destroy(true);
      }
    };
  }, [elId]);

  useEffect(() => {
    if (UIKitComponent.current) {
      Object.entries(events).forEach(([name, callback]) =>
        UIkit.util.on(document, name, "#" + elId, callback)
      );
    }

    return () => {
      if (UIKitComponent.current) {
        Object.entries(events).forEach(([name, callback]) =>
          UIkit.util.off(document, name, "#" + elId, callback)
        );
      }
    };
  }, [events, elId]);

  useEffect(() => {
    if (UIKitComponent.current) {
      const mergedOptions = {
        ...defaultOptions,
        ...options
      };

      UIKitComponent.current = UIkit.modal(
        document.getElementById(elId),
        mergedOptions
      );
    }
  }, [elId, options]);

  useEffect(() => {
    if (UIKitComponent.current) {
      if (show) {
        UIKitComponent.current.show();
      } else {
        UIKitComponent.current.hide();
      }
    }
  }, [show]);

  useEffect(() => {
    if (UIKitComponent.current) {
      UIKitComponent.current.$emit("update");
    }
  });

  return (
    <div id={elId}>
      <div className="uk-modal-dialog uk-modal-body">{children}</div>
    </div>
  );
};

export default Modal;
