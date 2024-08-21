import type { ColumnPinnedType, HeaderRowCtrl, IHeaderRowContainerComp } from '@ag-grid-community/core';
import { HeaderRowContainerCtrl } from '@ag-grid-community/core';
import React, { memo, useCallback, useContext, useRef, useState } from 'react';

import { BeansContext } from '../beansContext';
import HeaderRowComp from './headerRowComp';

const HeaderRowContainerComp = ({ pinned }: { pinned: ColumnPinnedType }) => {
    const [displayed, setDisplayed] = useState<true | false>(true);
    const [headerRowCtrls, setHeaderRowCtrls] = useState<HeaderRowCtrl[]>([]);

    const { context } = useContext(BeansContext);
    const eGui = useRef<HTMLDivElement | null>(null);
    const eCenterContainer = useRef<HTMLDivElement>(null);
    const headerRowCtrlRef = useRef<HeaderRowContainerCtrl | null>(null);

    const pinnedLeft = pinned === 'left';
    const pinnedRight = pinned === 'right';
    const centre = !pinnedLeft && !pinnedRight;

    const setRef = useCallback((e: HTMLDivElement) => {
        eGui.current = e;
        if (!eGui.current) {
            context.destroyBean(headerRowCtrlRef.current);
            headerRowCtrlRef.current = null;
            return;
        }

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

        headerRowCtrlRef.current = context.createBean(new HeaderRowContainerCtrl(pinned));
        headerRowCtrlRef.current.setComp(compProxy, eGui.current);
    }, []);

    const className = !displayed ? 'ag-hidden' : '';

    const insertRowsJsx = () => headerRowCtrls.map((ctrl) => <HeaderRowComp ctrl={ctrl} key={ctrl.instanceId} />);

    return (
        <>
            {pinnedLeft && (
                <div
                    ref={setRef}
                    className={'ag-pinned-left-header ' + className}
                    aria-hidden={!displayed}
                    role="rowgroup"
                >
                    {insertRowsJsx()}
                </div>
            )}
            {pinnedRight && (
                <div
                    ref={setRef}
                    className={'ag-pinned-right-header ' + className}
                    aria-hidden={!displayed}
                    role="rowgroup"
                >
                    {insertRowsJsx()}
                </div>
            )}
            {centre && (
                <div ref={setRef} className={'ag-header-viewport ' + className} role="presentation">
                    <div ref={eCenterContainer} className={'ag-header-container'} role="rowgroup">
                        {insertRowsJsx()}
                    </div>
                </div>
            )}
        </>
    );
};

export default memo(HeaderRowContainerComp);
