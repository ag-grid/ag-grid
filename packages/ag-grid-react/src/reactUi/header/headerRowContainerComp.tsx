import React, { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';

import type { ColumnPinnedType, HeaderRowCtrl, IHeaderRowContainerComp } from 'ag-grid-community';
import { HeaderRowContainerCtrl } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import HeaderRowComp from './headerRowComp';

const HeaderRowContainerComp = ({ pinned }: { pinned: ColumnPinnedType }) => {
    const [displayed, setDisplayed] = useState<true | false>(true);
    const [headerRowCtrls, setHeaderRowCtrls] = useState<HeaderRowCtrl[]>([]);

    const { context } = useContext(BeansContext);
    const eGui = useRef<HTMLDivElement | null>(null);
    const eCenterContainer = useRef<HTMLDivElement>(null);
    const headerRowCtrlRef = useRef<HeaderRowContainerCtrl>();
    const prevERef = useRef<HTMLDivElement | null>(null);

    const pinnedLeft = pinned === 'left';
    const pinnedRight = pinned === 'right';
    const centre = !pinnedLeft && !pinnedRight;

    const setRef = useCallback((eRef: HTMLDivElement) => {
        eGui.current = eRef;

        if (!eRef) {
            // Don't destroy yet - StrictMode may remount with same element
            return;
        }

        // Same element and valid ctrl? Reuse it (StrictMode remount)
        if (eRef === prevERef.current && headerRowCtrlRef.current && !context.isDestroyed()) {
            return;
        }

        // Different element means different instance - destroy old first
        if (prevERef.current && prevERef.current !== eRef) {
            headerRowCtrlRef.current = context.destroyBean(headerRowCtrlRef.current);
        }

        prevERef.current = eRef;

        if (context.isDestroyed()) {
            headerRowCtrlRef.current = context.destroyBean(headerRowCtrlRef.current);
            return;
        }

        headerRowCtrlRef.current = context.createBean(new HeaderRowContainerCtrl(pinned));

        const compProxy: IHeaderRowContainerComp = {
            setDisplayed,
            setCtrls: (ctrls) => setHeaderRowCtrls(ctrls),

            // centre only
            setCenterWidth: (width) => {
                if (eCenterContainer.current) {
                    eCenterContainer.current.style.width = width;
                }
            },
            setViewportScrollLeft: (left) => {
                if (eGui.current) {
                    eGui.current.scrollLeft = left;
                }
            },

            // pinned only
            setPinnedContainerWidth: (width) => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                    eGui.current.style.minWidth = width;
                    eGui.current.style.maxWidth = width;
                }
            },
        };

        headerRowCtrlRef.current!.setComp(compProxy, eGui.current);
    }, []);

    // Handle cleanup on true unmount (not StrictMode's simulated unmount)
    useEffect(() => {
        return () => {
            // Only destroy if element is truly gone from DOM
            if (prevERef.current && !document.contains(prevERef.current)) {
                headerRowCtrlRef.current = context.destroyBean(headerRowCtrlRef.current);
            }
        };
    }, []);

    const className = !displayed ? 'ag-hidden' : '';

    const insertRowsJsx = () => headerRowCtrls.map((ctrl) => <HeaderRowComp ctrl={ctrl} key={ctrl.instanceId} />);

    return pinnedLeft ? (
        <div ref={setRef} className={'ag-pinned-left-header ' + className} aria-hidden={!displayed} role="rowgroup">
            {insertRowsJsx()}
        </div>
    ) : pinnedRight ? (
        <div ref={setRef} className={'ag-pinned-right-header ' + className} aria-hidden={!displayed} role="rowgroup">
            {insertRowsJsx()}
        </div>
    ) : centre ? (
        <div ref={setRef} className={'ag-header-viewport ' + className} role="rowgroup" tabIndex={-1}>
            <div ref={eCenterContainer} className={'ag-header-container'} role="presentation">
                {insertRowsJsx()}
            </div>
        </div>
    ) : null;
};

export default memo(HeaderRowContainerComp);
