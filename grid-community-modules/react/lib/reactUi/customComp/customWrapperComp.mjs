// @ag-grid-community/react v31.0.2
import React, { memo, useEffect, useState } from "react";
import { CustomContext } from "../../shared/customComp/customContext.mjs";
const CustomWrapperComp = (params) => {
    const { initialProps, addUpdateCallback, CustomComponentClass, setMethods } = params;
    const [props, setProps] = useState(initialProps);
    useEffect(() => {
        addUpdateCallback(newProps => setProps(newProps));
    }, []);
    return (React.createElement(CustomContext.Provider, { value: { setMethods } },
        React.createElement(CustomComponentClass, Object.assign({}, props))));
};
export default memo(CustomWrapperComp);
