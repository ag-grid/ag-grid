import type { IGridHeaderComp } from '@ag-grid-community/core';
import { GridHeaderCtrl } from '@ag-grid-community/core';
import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { BeansContext } from '../beansContext';
import { CssClasses } from '../utils';
import HeaderRowContainerComp from './headerRowContainerComp';

const GridHeaderComp = () => {
    const [cssClasses, setCssClasses] = useState<CssClasses>(() => new CssClasses());
    const [height, setHeight] = useState<string>();

    const { context } = useContext(BeansContext);
    const eGui = useRef<HTMLDivElement | null>(null);
    const gridCtrlRef = useRef<GridHeaderCtrl>();

    const compProxy = useRef<IGridHeaderComp>({
        addOrRemoveCssClass: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
        setHeightAndMinHeight: (height) => setHeight(height),
    });

    const setRef = useCallback((eRef: HTMLDivElement | null) => {
        eGui.current = eRef;
        gridCtrlRef.current = eRef
            ? context.createBean(new GridHeaderCtrl())
            : context.destroyBean(gridCtrlRef.current);

        if (!eRef) return;

        gridCtrlRef.current?.setComp(compProxy.current, eRef, eRef);
    }, []);

    const className = useMemo(() => {
        const res = cssClasses.toString();
        return 'ag-header ' + res;
    }, [cssClasses]);

    const style = useMemo(
        () => ({
            height: height,
            minHeight: height,
        }),
        [height]
    );

    return (
        <div ref={setRef} className={className} style={style} role="presentation">
            <HeaderRowContainerComp pinned={'left'} />
            <HeaderRowContainerComp pinned={null} />
            <HeaderRowContainerComp pinned={'right'} />
        </div>
    );
};

export default memo(GridHeaderComp);
