import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';

import type { IRowContainerComp, RowContainerName, RowCtrl } from 'ag-grid-community';
import {
    RowContainerCtrl,
    _getRowContainerClass,
    _getRowContainerOptions,
    _getRowSpanContainerClass,
    _getRowViewportClass,
} from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import useReactCommentEffect from '../reactComment';
import { agFlushSync, classesList, getNextValueIfDifferent } from '../utils';
import RowComp from './rowComp';

const RowContainerComp = ({ name }: { name: RowContainerName }) => {
    const { context, gos } = useContext(BeansContext);

    const containerOptions = useMemo(() => _getRowContainerOptions(name), [name]);

    const eViewport = useRef<HTMLDivElement | null>(null);
    const eContainer = useRef<HTMLDivElement | null>(null);
    const eSpanContainer = useRef<HTMLDivElement | null>(null);
    const rowCtrlsRef = useRef<RowCtrl[]>([]);
    const prevRowCtrlsRef = useRef<RowCtrl[]>([]);
    const [rowCtrlsOrdered, setRowCtrlsOrdered] = useState<RowCtrl[]>(() => []);

    const isSpanning = !!gos.get('enableCellSpan') && !!containerOptions.getSpannedRowCtrls;
    const spannedRowCtrlsRef = useRef<RowCtrl[]>([]);
    const prevSpannedRowCtrlsRef = useRef<RowCtrl[]>([]);
    const [spannedRowCtrlsOrdered, setSpannedRowCtrlsOrdered] = useState<RowCtrl[]>(() => []);

    const domOrderRef = useRef<boolean>(false);
    const rowContainerCtrlRef = useRef<RowContainerCtrl>();

    const viewportClasses = useMemo(() => classesList('ag-viewport', _getRowViewportClass(name)), [name]);
    const containerClasses = useMemo(() => classesList(_getRowContainerClass(name)), [name]);
    const spanClasses = useMemo(() => classesList('ag-spanning-container', _getRowSpanContainerClass(name)), [name]);

    const shouldRenderViewport = containerOptions.type === 'center' || isSpanning;

    const topLevelRef = shouldRenderViewport ? eViewport : eContainer;

    useReactCommentEffect(' AG Row Container ' + name + ' ', topLevelRef);

    const areElementsReady = useCallback(() => {
        const viewportReady = !shouldRenderViewport || eViewport.current != null;
        const containerReady = eContainer.current != null;
        const spanContainerReady = !isSpanning || eSpanContainer.current != null;
        return viewportReady && containerReady && spanContainerReady;
    }, []);

    const areElementsRemoved = useCallback(() => {
        return eViewport.current == null && eContainer.current == null && eSpanContainer.current == null;
    }, []);

    const setRef = useCallback(() => {
        if (areElementsRemoved()) {
            rowContainerCtrlRef.current = context.destroyBean(rowContainerCtrlRef.current);
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

            const updateSpannedRowCtrlsOrdered = (useFlushSync: boolean) => {
                const next = getNextValueIfDifferent(
                    prevSpannedRowCtrlsRef.current,
                    spannedRowCtrlsRef.current,
                    domOrderRef.current
                )!;
                if (next !== prevSpannedRowCtrlsRef.current) {
                    prevSpannedRowCtrlsRef.current = next;
                    agFlushSync(useFlushSync, () => setSpannedRowCtrlsOrdered(next));
                }
            };

            const compProxy: IRowContainerComp = {
                setHorizontalScroll: (offset: number) => {
                    if (eViewport.current) {
                        eViewport.current.scrollLeft = offset;
                    }
                },
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
                setSpannedRowCtrls: (rowCtrls: RowCtrl[], useFlushSync: boolean) => {
                    const useFlush = !!useFlushSync && spannedRowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
                    // Keep a record of the rowCtrls in case we need to reset the Dom order.
                    spannedRowCtrlsRef.current = rowCtrls;
                    updateSpannedRowCtrlsOrdered(useFlush);
                },
                setDomOrder: (domOrder: boolean) => {
                    if (domOrderRef.current != domOrder) {
                        domOrderRef.current = domOrder;
                        updateRowCtrlsOrdered(false);
                    }
                },
                setContainerWidth: (width: string) => {
                    if (eContainer.current) {
                        eContainer.current.style.width = width;
                    }
                },
                setOffsetTop: (offset: string) => {
                    if (eContainer.current) {
                        eContainer.current.style.transform = `translateY(${offset})`;
                    }
                },
            };

            rowContainerCtrlRef.current = context.createBean(new RowContainerCtrl(name));
            rowContainerCtrlRef.current.setComp(compProxy, eContainer.current!, eViewport.current!);
        }
    }, [areElementsReady, areElementsRemoved]);

    const setContainerRef = useCallback(
        (e: HTMLDivElement | null) => {
            eContainer.current = e;
            setRef();
        },
        [setRef]
    );
    const setSpanContainerRef = useCallback(
        (e: HTMLDivElement | null) => {
            eSpanContainer.current = e;
            setRef();
        },
        [setRef]
    );
    const setViewportRef = useCallback(
        (e: HTMLDivElement | null) => {
            eViewport.current = e;
            setRef();
        },
        [setRef]
    );

    const buildContainer = () => (
        <div className={containerClasses} ref={setContainerRef} role={'rowgroup'}>
            {rowCtrlsOrdered.map((rowCtrl) => (
                <RowComp rowCtrl={rowCtrl} containerType={containerOptions.type} key={rowCtrl.instanceId}></RowComp>
            ))}
        </div>
    );

    if (!shouldRenderViewport) {
        return buildContainer();
    }

    const buildSpanContainer = () =>
        isSpanning && (
            <div className={spanClasses} ref={setSpanContainerRef} role={'rowgroup'}>
                {spannedRowCtrlsOrdered.map((rowCtrl) => (
                    <RowComp rowCtrl={rowCtrl} containerType={containerOptions.type} key={rowCtrl.instanceId}></RowComp>
                ))}
            </div>
        );

    return (
        <div className={viewportClasses} ref={setViewportRef} role="presentation">
            {buildContainer()}
            {buildSpanContainer()}
        </div>
    );
};

export default memo(RowContainerComp);
