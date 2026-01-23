import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';

import type { IGridHeaderComp } from 'ag-grid-community';
import { GridHeaderCtrl } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import { CssClasses, isElementHiddenInDom } from '../utils';
import HeaderRowContainerComp from './headerRowContainerComp';

const GridHeaderComp = () => {
    const [cssClasses, setCssClasses] = useState<CssClasses>(() => new CssClasses());
    const [height, setHeight] = useState<string>();

    const { context } = useContext(BeansContext);
    const eGui = useRef<HTMLDivElement | null>(null);
    const gridCtrlRef = useRef<GridHeaderCtrl>();
    const pendingDestroyTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const setRef = useCallback((eRef: HTMLDivElement | null) => {
        const previousEGui = eGui.current;
        eGui.current = eRef;

        if (!eRef) {
            // Schedule destruction to allow Activity hiding check.
            pendingDestroyTimeoutRef.current = setTimeout(() => {
                if (previousEGui && isElementHiddenInDom(previousEGui)) {
                    return;
                }
                gridCtrlRef.current = context.destroyBean(gridCtrlRef.current);
            }, 0);
            return;
        }

        // Cancel any pending destruction
        if (pendingDestroyTimeoutRef.current) {
            clearTimeout(pendingDestroyTimeoutRef.current);
            pendingDestroyTimeoutRef.current = undefined;
        }

        // If already initialized (Activity case), reuse
        if (gridCtrlRef.current || context.isDestroyed()) {
            return;
        }

        gridCtrlRef.current = context.createBean(new GridHeaderCtrl());

        const compProxy: IGridHeaderComp = {
            toggleCss: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
            setHeightAndMinHeight: (height) => setHeight(height),
        };

        gridCtrlRef.current!.setComp(compProxy, eRef, eRef);
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
