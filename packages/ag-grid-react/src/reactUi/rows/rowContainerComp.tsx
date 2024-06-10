import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';

import type { IRowContainerComp, RowContainerName, RowCtrl } from 'ag-grid-community';
import { RowContainerCtrl, getRowContainerOptions } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import useReactCommentEffect from '../reactComment';
import { agFlushSync, classesList, getNextValueIfDifferent } from '../utils';
import RowComp from './rowComp';

const RowContainerComp = (params: { name: RowContainerName }) => {
    const { context } = useContext(BeansContext);

    const { name } = params;
    const containerType = useMemo(() => getRowContainerOptions(name).type, [name]);

    const eViewport = useRef<HTMLDivElement | null>(null);
    const eContainer = useRef<HTMLDivElement | null>(null);

    const rowCtrlsRef = useRef<RowCtrl[]>([]);
    const prevRowCtrlsRef = useRef<RowCtrl[]>([]);
    const [rowCtrlsOrdered, setRowCtrlsOrdered] = useState<RowCtrl[]>(() => []);
    const domOrderRef = useRef<boolean>(false);
    const rowContainerCtrlRef = useRef<RowContainerCtrl | null>();

    const containerOptions = getRowContainerOptions(name);
    const viewportClasses = useMemo(() => classesList(containerOptions.viewport), [containerOptions]);
    const containerClasses = useMemo(() => classesList(containerOptions.container), [containerOptions]);

    const isCenter = containerOptions.type === 'center';

    const topLevelRef = isCenter ? eViewport : eContainer;

    useReactCommentEffect(' AG Row Container ' + name + ' ', topLevelRef);

    const areElementsReady = useCallback(() => {
        if (isCenter) {
            return eViewport.current != null && eContainer.current != null;
        }
        return eContainer.current != null;
    }, []);

    const areElementsRemoved = useCallback(() => {
        if (isCenter) {
            return eViewport.current == null && eContainer.current == null;
        }
        return eContainer.current == null;
    }, []);

    const setRef = useCallback(() => {
        if (areElementsRemoved()) {
            context.destroyBean(rowContainerCtrlRef.current);
            rowContainerCtrlRef.current = null;
        }
        if (areElementsReady()) {
            const updateRowCtrlsOrdered = (useFlushSync: boolean) => {
                const next = getNextValueIfDifferent(
                    prevRowCtrlsRef.current,
                    rowCtrlsRef.current,
                    domOrderRef.current
                )!;
                if (next !== prevRowCtrlsRef.current) {
                    prevRowCtrlsRef.current = next;
                    agFlushSync(useFlushSync, () => setRowCtrlsOrdered(next));
                }
            };

            const compProxy: IRowContainerComp = {
                setViewportHeight: (height: string) => {
                    if (eViewport.current) {
                        eViewport.current.style.height = height;
                    }
                },
                setRowCtrls: ({ rowCtrls, useFlushSync }: { rowCtrls: RowCtrl[]; useFlushSync?: boolean }) => {
                    const useFlush = !!useFlushSync && rowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
                    // Keep a record of the rowCtrls in case we need to reset the Dom order.
                    rowCtrlsRef.current = rowCtrls;
                    updateRowCtrlsOrdered(useFlush);
                },
                setDomOrder: (domOrder) => {
                    if (domOrderRef.current != domOrder) {
                        domOrderRef.current = domOrder;
                        updateRowCtrlsOrdered(false);
                    }
                },
                setContainerWidth: (width) => {
                    if (eContainer.current) {
                        eContainer.current.style.width = width;
                    }
                },
            };

            rowContainerCtrlRef.current = context.createBean(new RowContainerCtrl(name));
            rowContainerCtrlRef.current.setComp(compProxy, eContainer.current!, eViewport.current!);
        }
    }, [areElementsReady, areElementsRemoved]);

    const setContainerRef = useCallback(
        (e: HTMLDivElement) => {
            eContainer.current = e;
            setRef();
        },
        [setRef]
    );
    const setViewportRef = useCallback(
        (e: HTMLDivElement) => {
            eViewport.current = e;
            setRef();
        },
        [setRef]
    );

    const buildContainer = () => (
        <div className={containerClasses} ref={setContainerRef} role={'rowgroup'}>
            {rowCtrlsOrdered.map((rowCtrl) => (
                <RowComp rowCtrl={rowCtrl} containerType={containerType} key={rowCtrl.getInstanceId()}></RowComp>
            ))}
        </div>
    );

    return (
        <>
            {isCenter ? (
                <div className={viewportClasses} ref={setViewportRef} role="presentation">
                    {buildContainer()}
                </div>
            ) : (
                buildContainer()
            )}
        </>
    );
};

export default memo(RowContainerComp);
