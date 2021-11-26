import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import {
    IGridHeaderComp, GridHeaderCtrl, Constants
} from '@ag-grid-community/core';
import { CssClasses } from '../utils';
import HeaderRowContainerComp from './headerRowContainerComp';


const GridHeaderComp = () => {

    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [height, setHeight] = useState<string>();

    const {context} = useContext(BeansContext);
    const eGui = useRef<HTMLDivElement>(null);

    useEffect(() => {

        const compProxy: IGridHeaderComp = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setHeightAndMinHeight: height => setHeight(height)
        };

        const ctrl = context.createBean(new GridHeaderCtrl());
        ctrl.setComp(compProxy, eGui.current!, eGui.current!);

        return () => {
            context.destroyBean(ctrl);
        };

    }, []);

    const className = useMemo( ()=> {
        let res = cssClasses.toString();
        return 'ag-header ' + res;
    }, [cssClasses]);

    const style = useMemo( ()=> ({
        height: height,
        minHeight: height
    }), [height]);

    return (
        <div ref={eGui} className={className} style={style} role="presentation">
            <HeaderRowContainerComp pinned={Constants.PINNED_LEFT}/>
            <HeaderRowContainerComp pinned={null}/>
            <HeaderRowContainerComp pinned={Constants.PINNED_RIGHT}/>
        </div>
    );
};

export default memo(GridHeaderComp);
