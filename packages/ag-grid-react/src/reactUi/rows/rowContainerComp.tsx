import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { IRowContainerComp, RowCtrl } from 'ag-grid-community';
import {
    RowContainerCtrl,
    _getRowContainerClass,
    _getRowContainerOptions,
    _getRowSpanContainerClass,
} from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import useReactCommentEffect from '../reactComment';
import { agFlushSync, classesList, getNextValueIfDifferent } from '../utils';
import RowComp from './rowComp';

export type ReactRowContainerName = 'scrollingCenter' | 'pinnedTopCenter' | 'pinnedBottomCenter';

type CommunityRowContainerName = Parameters<typeof _getRowContainerOptions>[0];
const asCommunityRowContainerName = (name: ReactRowContainerName): CommunityRowContainerName =>
    name as CommunityRowContainerName;

const RowContainerComp = ({
    name,
    viewportElement,
    onContainerElementChanged,
}: {
    name: ReactRowContainerName;
    viewportElement?: HTMLElement | null;
    onContainerElementChanged?: (element: HTMLDivElement | null) => void;
}) => {
    const { context, gos } = useContext(BeansContext);

    const containerOptions = useMemo(() => _getRowContainerOptions(asCommunityRowContainerName(name)), [name]);

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

    const containerClasses = useMemo(
        () => classesList(_getRowContainerClass(asCommunityRowContainerName(name))),
        [name]
    );
    const spanClasses = useMemo(
        () => classesList('ag-spanning-container', _getRowSpanContainerClass(asCommunityRowContainerName(name))),
        [name]
    );

    useReactCommentEffect(' AG Row Container ' + name + ' ', eContainer);

    const setRef = useCallback(() => {
        if (eContainer.current == null && eSpanContainer.current == null) {
            rowContainerCtrlRef.current = context.destroyBean(rowContainerCtrlRef.current);
        }
        if (context.isDestroyed()) {
            return;
        }

        const eContainerForCtrl = eContainer.current;
        const eViewportForCtrl = viewportElement ?? eContainer.current;
        if (!eContainerForCtrl || !eViewportForCtrl || (isSpanning && !eSpanContainer.current)) {
            return;
        }
        if (rowContainerCtrlRef.current) {
            return;
        }

        const eSpanContainerForCtrl = eSpanContainer.current ?? undefined;

        const updateRowCtrlsOrdered = (useFlushSync: boolean) => {
            const next = getNextValueIfDifferent(prevRowCtrlsRef.current, rowCtrlsRef.current, domOrderRef.current)!;
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
                eViewportForCtrl.scrollLeft = offset;
            },
            setRowCtrls: ({ rowCtrls, useFlushSync }: { rowCtrls: RowCtrl[]; useFlushSync?: boolean }) => {
                const useFlush = !!useFlushSync && rowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
                rowCtrlsRef.current = rowCtrls;
                updateRowCtrlsOrdered(useFlush);
            },
            setSpannedRowCtrls: (rowCtrls: RowCtrl[], useFlushSync: boolean) => {
                const useFlush = !!useFlushSync && spannedRowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
                spannedRowCtrlsRef.current = rowCtrls;
                updateSpannedRowCtrlsOrdered(useFlush);
            },
            setDomOrder: (domOrder: boolean) => {
                if (domOrderRef.current !== domOrder) {
                    domOrderRef.current = domOrder;
                    updateRowCtrlsOrdered(false);
                }
            },
            setContainerWidth: (width: string) => {
                if (eContainerForCtrl) {
                    eContainerForCtrl.style.width = width;
                }
                if (eSpanContainerForCtrl) {
                    eSpanContainerForCtrl.style.width = width;
                }
            },
            setOffsetTop: (offset: string) => {
                eContainerForCtrl.style.transform = `translateY(${offset})`;
                if (eSpanContainerForCtrl) {
                    eSpanContainerForCtrl.style.transform = `translateY(${offset})`;
                }
            },
        };

        rowContainerCtrlRef.current = context.createBean(new RowContainerCtrl(asCommunityRowContainerName(name)));
        rowContainerCtrlRef.current.setComp(compProxy, eContainerForCtrl, eSpanContainerForCtrl, eViewportForCtrl);
    }, [context, isSpanning, name, viewportElement]);

    useEffect(
        () => () => {
            rowContainerCtrlRef.current = context.destroyBean(rowContainerCtrlRef.current);
        },
        [context, name]
    );

    const setContainerRef = useCallback(
        (e: HTMLDivElement | null) => {
            eContainer.current = e;
            onContainerElementChanged?.(e);
            setRef();
        },
        [onContainerElementChanged, setRef]
    );
    const setSpanContainerRef = useCallback(
        (e: HTMLDivElement | null) => {
            eSpanContainer.current = e;
            setRef();
        },
        [setRef]
    );

    const buildSpanContainer = () => (
        <div className={spanClasses} ref={setSpanContainerRef} role={'presentation'}>
            {spannedRowCtrlsOrdered.map((rowCtrl) => (
                <RowComp rowCtrl={rowCtrl} containerType={containerOptions.type} key={rowCtrl.instanceId}></RowComp>
            ))}
        </div>
    );

    const rows = rowCtrlsOrdered.map((rowCtrl) => (
        <RowComp rowCtrl={rowCtrl} containerType={containerOptions.type} key={rowCtrl.instanceId}></RowComp>
    ));

    return (
        <div className={containerClasses} ref={setContainerRef} role={'rowgroup'}>
            {rows}
            {isSpanning ? buildSpanContainer() : null}
        </div>
    );
};

export default memo(RowContainerComp);
