import React, { memo, useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';

import type { HeaderRowCtrl, IHeaderRowsComp } from 'ag-grid-community';
import { HeaderRowsCtrl } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import HeaderRowComp from './headerRowComp';

const HeaderRowsComp = ({
    eGui,
    eGridViewport,
    setHeaderRowFocusableElements,
}: {
    eGui: HTMLElement;
    eGridViewport: HTMLElement;
    setHeaderRowFocusableElements?: (elements: HTMLElement[]) => void;
}) => {
    const { context } = useContext(BeansContext);

    const [headerRowCtrls, setHeaderRowCtrls] = useState<HeaderRowCtrl[]>([]);
    const headerRowsCtrlRef = useRef<HeaderRowsCtrl>();
    const rowGuisRef = useRef(new Map<number, HTMLDivElement>());

    const setRowGui = useCallback((instanceId: number, eGui: HTMLDivElement | null) => {
        if (eGui) {
            rowGuisRef.current.set(instanceId, eGui);
        } else {
            rowGuisRef.current.delete(instanceId);
        }
    }, []);

    useLayoutEffect(() => {
        if (!setHeaderRowFocusableElements) {
            return;
        }

        setHeaderRowFocusableElements(
            headerRowCtrls
                .map((ctrl) => rowGuisRef.current.get(ctrl.instanceId))
                .filter((eGui): eGui is HTMLDivElement => !!eGui)
        );
    }, [headerRowCtrls, setHeaderRowFocusableElements]);

    useLayoutEffect(() => {
        if (!eGui || context.isDestroyed()) {
            headerRowsCtrlRef.current = context.destroyBean(headerRowsCtrlRef.current);
            return;
        }

        const compProxy: IHeaderRowsComp = {
            setCtrls: (ctrls) => setHeaderRowCtrls(ctrls),
            setViewportScrollLeft: (_left) => {},
        };

        headerRowsCtrlRef.current = context.createBean(new HeaderRowsCtrl());
        headerRowsCtrlRef.current.setComp(compProxy, eGui, eGridViewport);

        return () => {
            if (setHeaderRowFocusableElements) {
                setHeaderRowFocusableElements([]);
            }
            headerRowsCtrlRef.current = context.destroyBean(headerRowsCtrlRef.current);
        };
    }, [context, eGui, eGridViewport, setHeaderRowFocusableElements]);

    return (
        <>
            {headerRowCtrls.map((ctrl) => (
                <HeaderRowComp
                    ctrl={ctrl}
                    key={ctrl.instanceId}
                    setGuiRef={(eGui) => setRowGui(ctrl.instanceId, eGui)}
                />
            ))}
        </>
    );
};

export default memo(HeaderRowsComp);
