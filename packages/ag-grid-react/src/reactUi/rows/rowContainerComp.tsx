import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { IRowContainerComp, RowCtrl } from 'ag-grid-community';
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

export type ReactRowContainerName =
    | 'scrollingCenter'
    | 'scrollingFullWidth'
    | 'pinnedTopCenter'
    | 'pinnedTopFullWidth'
    | 'stickyTopCenter'
    | 'stickyTopFullWidth'
    | 'stickyBottomCenter'
    | 'stickyBottomFullWidth'
    | 'pinnedBottomCenter'
    | 'pinnedBottomFullWidth';

type CommunityRowContainerName = Parameters<typeof _getRowContainerOptions>[0];
const asCommunityRowContainerName = (name: ReactRowContainerName): CommunityRowContainerName =>
    name as CommunityRowContainerName;

function isFlattenedPinnedRowContainer(name: ReactRowContainerName): boolean {
    return (
        name === 'pinnedTopCenter' ||
        name === 'pinnedTopFullWidth' ||
        name === 'stickyTopCenter' ||
        name === 'stickyTopFullWidth' ||
        name === 'pinnedBottomCenter' ||
        name === 'pinnedBottomFullWidth' ||
        name === 'stickyBottomCenter' ||
        name === 'stickyBottomFullWidth'
    );
}

const RowContainerComp = ({ name, hostElement }: { name: ReactRowContainerName; hostElement?: HTMLElement | null }) => {
    const { context, gos } = useContext(BeansContext);

    const containerOptions = useMemo(() => _getRowContainerOptions(asCommunityRowContainerName(name)), [name]);
    const isFlattenedPinnedContainer = useMemo(() => isFlattenedPinnedRowContainer(name), [name]);

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
    const ctrlHostRef = useRef<HTMLElement | null>(null);

    const viewportClasses = useMemo(
        () => classesList('ag-viewport', _getRowViewportClass(asCommunityRowContainerName(name))),
        [name]
    );
    const containerClasses = useMemo(
        () => classesList(_getRowContainerClass(asCommunityRowContainerName(name))),
        [name]
    );
    const spanClasses = useMemo(
        () => classesList('ag-spanning-container', _getRowSpanContainerClass(asCommunityRowContainerName(name))),
        [name]
    );

    const shouldRenderViewport =
        !isFlattenedPinnedContainer && name !== 'scrollingCenter' && (containerOptions.type === 'center' || isSpanning);

    const topLevelRef = shouldRenderViewport ? eViewport : eContainer;

    useReactCommentEffect(' AG Row Container ' + name + ' ', topLevelRef);

    const areElementsReady = useCallback(() => {
        if (isFlattenedPinnedContainer) {
            return hostElement != null;
        }
        const viewportReady = !shouldRenderViewport || eViewport.current != null;
        const containerReady = eContainer.current != null;
        const spanContainerReady = !isSpanning || eSpanContainer.current != null;
        return viewportReady && containerReady && spanContainerReady;
    }, [isFlattenedPinnedContainer, hostElement, shouldRenderViewport, isSpanning]);

    const areElementsRemoved = useCallback(() => {
        if (isFlattenedPinnedContainer) {
            return hostElement == null;
        }
        return eViewport.current == null && eContainer.current == null && eSpanContainer.current == null;
    }, [isFlattenedPinnedContainer, hostElement]);

    const setRef = useCallback(() => {
        if (isFlattenedPinnedContainer && areElementsRemoved()) {
            rowContainerCtrlRef.current = context.destroyBean(rowContainerCtrlRef.current);
            ctrlHostRef.current = null;
        }
        if (context.isDestroyed()) {
            return;
        }

        if (areElementsReady()) {
            if (isFlattenedPinnedContainer && rowContainerCtrlRef.current && ctrlHostRef.current !== hostElement) {
                rowContainerCtrlRef.current = context.destroyBean(rowContainerCtrlRef.current);
                ctrlHostRef.current = null;
            }
            if (rowContainerCtrlRef.current) {
                return;
            }
            const eContainerForCtrl = isFlattenedPinnedContainer ? hostElement! : eContainer.current!;
            const eSpanContainerForCtrl = isFlattenedPinnedContainer
                ? isSpanning
                    ? eContainerForCtrl
                    : undefined
                : eSpanContainer.current ?? undefined;
            const eViewportForCtrl =
                (isFlattenedPinnedContainer
                    ? (hostElement!.closest('.ag-grid-viewport') as HTMLDivElement | null) ?? hostElement!
                    : name === 'scrollingCenter'
                      ? (eContainer.current?.closest('.ag-grid-viewport') as HTMLDivElement | null)
                      : eViewport.current) ?? eContainerForCtrl;

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
                    if (eViewportForCtrl) {
                        eViewportForCtrl.scrollLeft = offset;
                    }
                },
                setViewportHeight: (height: string) => {
                    if (name !== 'scrollingCenter' && eViewportForCtrl) {
                        eViewportForCtrl.style.height = height;
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
                    if (!isFlattenedPinnedContainer && domOrderRef.current != domOrder) {
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
                    if (eContainerForCtrl) {
                        eContainerForCtrl.style.transform = `translateY(${offset})`;
                    }
                    if (eSpanContainerForCtrl) {
                        eSpanContainerForCtrl.style.transform = `translateY(${offset})`;
                    }
                },
            };

            rowContainerCtrlRef.current = context.createBean(new RowContainerCtrl(asCommunityRowContainerName(name)));
            ctrlHostRef.current = isFlattenedPinnedContainer ? eContainerForCtrl : null;
            rowContainerCtrlRef.current.setComp(compProxy, eContainerForCtrl, eSpanContainerForCtrl, eViewportForCtrl!);
        }
    }, [areElementsReady, areElementsRemoved, context, hostElement, isFlattenedPinnedContainer, isSpanning, name]);

    useEffect(() => {
        if (isFlattenedPinnedContainer) {
            setRef();
        }
    }, [isFlattenedPinnedContainer, hostElement, setRef]);

    useEffect(
        () => () => {
            rowContainerCtrlRef.current = context.destroyBean(rowContainerCtrlRef.current);
            ctrlHostRef.current = null;
        },
        [context, name]
    );

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

    const buildSpanContainer = () => (
        <div className={spanClasses} ref={setSpanContainerRef} role={'presentation'}>
            {spannedRowCtrlsOrdered.map((rowCtrl) => (
                <RowComp rowCtrl={rowCtrl} containerType={containerOptions.type} key={rowCtrl.instanceId}></RowComp>
            ))}
        </div>
    );

    const buildContainer = () => (
        <div
            className={containerClasses}
            ref={setContainerRef}
            role={shouldRenderViewport ? 'presentation' : 'rowgroup'}
        >
            {rowCtrlsOrdered.map((rowCtrl) => (
                <RowComp rowCtrl={rowCtrl} containerType={containerOptions.type} key={rowCtrl.instanceId}></RowComp>
            ))}
            {!shouldRenderViewport && isSpanning ? buildSpanContainer() : null}
        </div>
    );

    if (!shouldRenderViewport) {
        if (isFlattenedPinnedContainer) {
            if (!hostElement) {
                return null;
            }
            return createPortal(
                <>
                    {rowCtrlsOrdered.map((rowCtrl) => (
                        <RowComp rowCtrl={rowCtrl} containerType={containerOptions.type} key={rowCtrl.instanceId} />
                    ))}
                    {isSpanning
                        ? spannedRowCtrlsOrdered.map((rowCtrl) => (
                              <RowComp
                                  rowCtrl={rowCtrl}
                                  containerType={containerOptions.type}
                                  key={`span-${rowCtrl.instanceId}`}
                              ></RowComp>
                          ))
                        : null}
                </>,
                hostElement
            );
        }
        return buildContainer();
    }

    return (
        <div className={viewportClasses} ref={setViewportRef} role="rowgroup">
            {buildContainer()}
            {isSpanning ? buildSpanContainer() : null}
        </div>
    );
};

export default memo(RowContainerComp);
