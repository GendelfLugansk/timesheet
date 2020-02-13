import React, { useEffect, useState, useRef } from "react";
import uuidv4 from "uuid/v4";
/*global UIkit*/

const defaultOptions = {
  escClose: false,
  bgClose: false
};

const Modal = ({ show = false, options = {}, children }) => {
  const [elId] = useState(uuidv4());
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
      const mergedOptions = {
        ...defaultOptions,
        ...options
      };

      UIKitComponent.current = UIkit.modal(
        document.getElementById(elId),
        mergedOptions
      );

      if (show) {
        UIKitComponent.current.show();
      } else {
        UIKitComponent.current.hide();
      }
    }
  }, [elId, show, options]);

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
