import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { IGridHeaderComp } from 'ag-grid-community';
import { GridHeaderCtrl } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import { CssClasses } from '../utils';
import HeaderRowContainerComp from './headerRowContainerComp';

const GridHeaderComp = () => {
    const [cssClasses, setCssClasses] = useState<CssClasses>(() => new CssClasses());
    const [height, setHeight] = useState<string>();

    const { context } = useContext(BeansContext);
    const eGui = useRef<HTMLDivElement | null>(null);
    const gridCtrlRef = useRef<GridHeaderCtrl>();
    const prevERef = useRef<HTMLDivElement | null>(null);

    const setRef = useCallback((eRef: HTMLDivElement | null) => {
        eGui.current = eRef;

        if (!eRef) {
            // Don't destroy yet - StrictMode may remount with same element
            return;
        }

        // Same element and valid ctrl? Reuse it (StrictMode remount)
        if (eRef === prevERef.current && gridCtrlRef.current && !context.isDestroyed()) {
            return;
        }

        // Different element means different instance - destroy old first
        if (prevERef.current && prevERef.current !== eRef) {
            gridCtrlRef.current = context.destroyBean(gridCtrlRef.current);
        }

        prevERef.current = eRef;

        if (context.isDestroyed()) {
            gridCtrlRef.current = context.destroyBean(gridCtrlRef.current);
            return;
        }

        gridCtrlRef.current = context.createBean(new GridHeaderCtrl());

        const compProxy: IGridHeaderComp = {
            toggleCss: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
            setHeightAndMinHeight: (height) => setHeight(height),
        };

        gridCtrlRef.current!.setComp(compProxy, eRef, eRef);
    }, []);

    // Handle cleanup on true unmount (not StrictMode's simulated unmount)
    useEffect(() => {
        return () => {
            // Only destroy if element is truly gone from DOM
            if (prevERef.current && !document.contains(prevERef.current)) {
                gridCtrlRef.current = context.destroyBean(gridCtrlRef.current);
            }
        };
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
