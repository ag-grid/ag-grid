import React, { memo, useEffect, useState } from "react";
import { CustomContext, WrapperParams } from "../../shared/customComp/customComponent"

const CustomWrapperComp = <P, M>(params: WrapperParams<P, M>) => {
    const { initialProps, addUpdateCallback, CustomComponentClass, setMethods } = params;

    const [props, setProps] = useState(initialProps);

    useEffect(() => {
        addUpdateCallback(newProps => setProps(newProps));
    }, []);

    return (
        <CustomContext.Provider value={{ setMethods }}>
            <CustomComponentClass {...props}/>
        </CustomContext.Provider>
    );
}

export default memo(CustomWrapperComp);
