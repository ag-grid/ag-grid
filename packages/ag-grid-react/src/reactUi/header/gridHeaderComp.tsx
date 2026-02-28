import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { HeaderRowCtrl, IGridHeaderComp, IHeaderRowContainerComp } from 'ag-grid-community';
import { GridHeaderCtrl, HeaderRowContainerCtrl } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import { CssClasses } from '../utils';
import HeaderRowComp from './headerRowComp';

const GridHeaderComp = ({
    hostElement,
    flattened = false,
}: {
    hostElement?: HTMLElement | null;
    flattened?: boolean;
}) => {
    const [cssClasses, setCssClasses] = useState<CssClasses>(() => new CssClasses());
    const [height, setHeight] = useState<string>();
    const [headerRowCtrls, setHeaderRowCtrls] = useState<HeaderRowCtrl[]>([]);

    const { context } = useContext(BeansContext);
    const gridCtrlRef = useRef<GridHeaderCtrl>();
    const headerRowContainerCtrlRef = useRef<HeaderRowContainerCtrl>();
    const ePinnedTopRowsHostRef = useRef<HTMLElement | null>(null);

    const destroyControllers = useCallback(() => {
        if (ePinnedTopRowsHostRef.current) {
            ePinnedTopRowsHostRef.current?.style.removeProperty('--ag-header-rows-height');
        }
        ePinnedTopRowsHostRef.current = null;
        gridCtrlRef.current = context.destroyBean(gridCtrlRef.current);
        headerRowContainerCtrlRef.current = context.destroyBean(headerRowContainerCtrlRef.current);
    }, [context]);

    const initControllers = useCallback(
        (eHeaderHost: HTMLElement, isFlattened: boolean) => {
            if (context.isDestroyed()) {
                return;
            }

            const eTopRowsContainer = isFlattened ? eHeaderHost : null;
            const ePinnedTopRowsHost = isFlattened
                ? (eTopRowsContainer?.closest('.ag-grid-pinned-top-rows') as HTMLElement | null) ?? null
                : null;
            if (ePinnedTopRowsHostRef.current && ePinnedTopRowsHostRef.current !== ePinnedTopRowsHost) {
                ePinnedTopRowsHostRef.current.style.removeProperty('--ag-header-rows-height');
            }
            ePinnedTopRowsHostRef.current = ePinnedTopRowsHost;

            const compProxy: IGridHeaderComp = {
                toggleCss: (name, on) => {
                    if (isFlattened) {
                        eHeaderHost.classList.toggle(name, on);
                    } else {
                        setCssClasses((prev) => prev.setClass(name, on));
                    }
                },
                setHeightAndMinHeight: (height) => {
                    if (isFlattened) {
                        ePinnedTopRowsHost?.style.setProperty('--ag-header-rows-height', height);
                        setHeight(undefined);
                        return;
                    }

                    setHeight(height);
                },
            };
            const rowContainerCompProxy: IHeaderRowContainerComp = {
                setCtrls: (ctrls) => setHeaderRowCtrls(ctrls),
                setViewportScrollLeft: (left) => {
                    if (!isFlattened) {
                        eHeaderHost.scrollLeft = left;
                    }
                },
            };
            const eScrollViewport = isFlattened
                ? (eHeaderHost.closest('.ag-grid-viewport') as HTMLElement | null) ?? eHeaderHost
                : eHeaderHost;

            gridCtrlRef.current = context.destroyBean(gridCtrlRef.current);
            headerRowContainerCtrlRef.current = context.destroyBean(headerRowContainerCtrlRef.current);

            gridCtrlRef.current = context.createBean(new GridHeaderCtrl());
            headerRowContainerCtrlRef.current = context.createBean(new HeaderRowContainerCtrl());
            gridCtrlRef.current.setComp(compProxy, eHeaderHost, eHeaderHost);
            headerRowContainerCtrlRef.current.setComp(rowContainerCompProxy, eHeaderHost, eScrollViewport);
        },
        [context]
    );

    const setRef = useCallback(
        (eRef: HTMLDivElement | null) => {
            if (flattened) {
                return;
            }
            if (!eRef) {
                destroyControllers();
                return;
            }
            initControllers(eRef, false);
        },
        [destroyControllers, flattened, initControllers]
    );

    useEffect(() => {
        if (!flattened || !hostElement) {
            return;
        }
        initControllers(hostElement, true);
        return () => {
            destroyControllers();
        };
    }, [destroyControllers, flattened, hostElement, initControllers]);

    useEffect(() => {
        return () => {
            destroyControllers();
        };
    }, [destroyControllers]);

    const className = useMemo(() => {
        const res = cssClasses.toString();
        return 'ag-header ' + res;
    }, [cssClasses]);

    const style = useMemo(() => (height ? { height, minHeight: height } : undefined), [height]);

    if (flattened) {
        if (!hostElement) {
            return null;
        }
        return createPortal(
            <>
                {headerRowCtrls.map((ctrl) => (
                    <HeaderRowComp ctrl={ctrl} key={ctrl.instanceId} />
                ))}
            </>,
            hostElement
        );
    }

    return (
        <div ref={setRef} className={className} style={style} role="rowgroup">
            {headerRowCtrls.map((ctrl) => (
                <HeaderRowComp ctrl={ctrl} key={ctrl.instanceId} />
            ))}
        </div>
    );
};

export default memo(GridHeaderComp);
