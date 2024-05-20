import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { GridHeaderCtrl, IGridHeaderComp } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import { CssClasses } from '../utils';
import HeaderRowContainerComp from './headerRowContainerComp';

const GridHeaderComp = () => {
    const [cssClasses, setCssClasses] = useState<CssClasses>(() => new CssClasses());
    const [height, setHeight] = useState<string>();

    const { context } = useContext(BeansContext);
    const eGui = useRef<HTMLDivElement | null>(null);
    const gridCtrlRef = useRef<GridHeaderCtrl | null>(null);

    const setRef = useCallback((e: HTMLDivElement) => {
        eGui.current = e;
        if (!e) {
            context.destroyBean(gridCtrlRef.current!);
            gridCtrlRef.current = null;
            return;
        }
        const compProxy: IGridHeaderComp = {
            addOrRemoveCssClass: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
            setHeightAndMinHeight: (height) => setHeight(height),
        };

        gridCtrlRef.current = context.createBean(new GridHeaderCtrl());
        gridCtrlRef.current.setComp(compProxy, eGui.current, eGui.current);
    }, []);

    const className = useMemo(() => {
        let res = cssClasses.toString();
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
