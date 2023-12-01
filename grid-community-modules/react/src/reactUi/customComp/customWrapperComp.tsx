import React, { memo, useEffect, useMemo, useState } from "react";
import { CustomContext, WrapperParams } from "../../shared/customComp/customComponent"

const CustomWrapperComp = <P, M>(params: WrapperParams<P, M>) => {
    const { initialProps, addUpdateCallback } = params;
    const CustomComponentClass = useMemo(() => params.CustomComponentClass, []);
    const customContext = useMemo(() => ({ setMethods: params.setMethods }), []);

    const [props, setProps] = useState(initialProps);

    useEffect(() => {
        addUpdateCallback(newProps => setProps(newProps));
    }, []);

    return (
        <CustomContext.Provider value={customContext}>
            <CustomComponentClass {...props}/>
        </CustomContext.Provider>
    );
}

export default memo(CustomWrapperComp);
