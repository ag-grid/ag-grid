import React, { memo, useEffect, useState } from 'react';

import type { WrapperParams } from '../../shared/customComp/customComponentWrapper';
import { CustomContext } from '../../shared/customComp/customContext';

const CustomWrapperComp = <P extends { key?: string }, M>(params: WrapperParams<P, M>) => {
    const { initialProps, addUpdateCallback, CustomComponentClass, setMethods } = params;

    const [{ key, ...props }, setProps] = useState(initialProps);

    useEffect(() => {
        // this allows the ts wrapper component to update the props passed into the custom component
        addUpdateCallback((newProps) => setProps(newProps));
    }, []);

    return (
        <CustomContext.Provider value={{ setMethods }}>
            <CustomComponentClass key={key} {...props} />
        </CustomContext.Provider>
    );
};

export default memo(CustomWrapperComp);
