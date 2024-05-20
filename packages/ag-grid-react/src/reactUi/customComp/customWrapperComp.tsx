import React, { memo, useEffect, useState } from 'react';

import { WrapperParams } from '../../shared/customComp/customComponentWrapper';
import { CustomContext } from '../../shared/customComp/customContext';

const CustomWrapperComp = <P, M>(params: WrapperParams<P, M>) => {
    const { initialProps, addUpdateCallback, CustomComponentClass, setMethods } = params;

    const [props, setProps] = useState(initialProps);

    useEffect(() => {
        // this allows the ts wrapper component to update the props passed into the custom component
        addUpdateCallback((newProps) => setProps(newProps));
    }, []);

    return (
        <CustomContext.Provider value={{ setMethods }}>
            <CustomComponentClass {...props} />
        </CustomContext.Provider>
    );
};

export default memo(CustomWrapperComp);
