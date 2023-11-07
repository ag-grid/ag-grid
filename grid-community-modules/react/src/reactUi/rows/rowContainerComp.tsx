import { getRowContainerTypeForName, IRowContainerComp, RowContainerCtrl, RowContainerName, RowCtrl } from '@ag-grid-community/core';
import React, { useMemo, useRef, useState, memo, useContext, useCallback } from 'react';
import { classesList, getNextValueIfDifferent } from '../utils';
import useReactCommentEffect from '../reactComment';
import RowComp from './rowComp';
import { BeansContext } from '../beansContext';

const RowContainerComp = (params: {name: RowContainerName}) => {

    const {context} = useContext(BeansContext);

    const { name } = params;
    const containerType = useMemo(() => getRowContainerTypeForName(name), [name]);

    const eViewport = useRef<HTMLDivElement | null>(null);
    const eContainer = useRef<HTMLDivElement | null>(null);

    const rowCtrlsRef = useRef<RowCtrl[]>([]);
    const orderedRowCtrlsRef = useRef<RowCtrl[]>([]);
    const domOrderRef = useRef<boolean>(false);
    const rowContainerCtrlRef = useRef<RowContainerCtrl | null>();
    const rowUpdateCallback = useRef<(() => void) | null>();

    const cssClasses = useMemo(() => RowContainerCtrl.getRowContainerCssClasses(name), [name]);
    const viewportClasses = useMemo( ()=> classesList(cssClasses.viewport), [cssClasses]);
    const containerClasses = useMemo( ()=> classesList(cssClasses.container), [cssClasses]);

    // no need to useMemo for boolean types
    const centerTemplate = name === RowContainerName.CENTER
        || name === RowContainerName.TOP_CENTER
        || name === RowContainerName.BOTTOM_CENTER
        || name === RowContainerName.STICKY_TOP_CENTER;

    const topLevelRef = centerTemplate ? eViewport : eContainer;

    useReactCommentEffect(' AG Row Container ' + name + ' ', topLevelRef);

    const areElementsReady = useCallback(() => {
        if (centerTemplate) {
            return eViewport.current != null && eContainer.current != null;
        }
        return eContainer.current != null;
    }, []);

    const areElementsRemoved = useCallback(() => {
        if (centerTemplate) {
            return eViewport.current == null && eContainer.current == null;
        }
        return eContainer.current == null;
    }, []);

    // With React 18 this will use the new useSyncExternalStore hook
    // With React 17 this will use the useState hook as the renderer is synchronous anyway.
    let rowCtrlsOrdered: RowCtrl[];
    if ((React as any).useSyncExternalStore) {
        const sub = useCallback((callback: any) => {
            rowUpdateCallback.current = callback;
            return () => {
                rowUpdateCallback.current = null;
            }
        }, []);

        rowCtrlsOrdered = React.useSyncExternalStore(sub, () => orderedRowCtrlsRef.current);
    } else {
        const [ctrlsOrdered, setCtrlsOrdered] = useState<RowCtrl[]>([]);
        rowUpdateCallback.current = () => setCtrlsOrdered(orderedRowCtrlsRef.current);
        rowCtrlsOrdered = ctrlsOrdered;
    }

    const setRef = useCallback(() => {
        if (areElementsRemoved()) {
            context.destroyBean(rowContainerCtrlRef.current);
            rowContainerCtrlRef.current = null;
        }
        if (areElementsReady()) {

            const updateRowCtrlsOrdered = () => {
                orderedRowCtrlsRef.current = getNextValueIfDifferent(orderedRowCtrlsRef.current, rowCtrlsRef.current, domOrderRef.current)!;
                if (rowUpdateCallback.current) {
                    rowUpdateCallback.current();
                }
            }

            const compProxy: IRowContainerComp = {
                setViewportHeight: (height: string) => {
                    if (eViewport.current) {
                        eViewport.current.style.height = height;
                    }
                },
                setRowCtrls: (rowCtrls) => {
                    // Keep a record of the rowCtrls in case we need to reset the Dom order.
                    rowCtrlsRef.current = rowCtrls;
                    updateRowCtrlsOrdered();
                },
                setDomOrder: domOrder => {
                    if (domOrderRef.current != domOrder) {
                        domOrderRef.current = domOrder;
                        updateRowCtrlsOrdered();
                    }
                },
                setContainerWidth: width => {
                    if (eContainer.current) {
                        eContainer.current.style.width = width;
                    }
                }
            }

            rowContainerCtrlRef.current = context.createBean(new RowContainerCtrl(name));
            rowContainerCtrlRef.current.setComp(compProxy, eContainer.current!, eViewport.current!);
        }

    }, [areElementsReady, areElementsRemoved]);

    const setContainerRef = useCallback((e: HTMLDivElement) => { eContainer.current = e; setRef(); }, [setRef]);
    const setViewportRef = useCallback((e: HTMLDivElement) => { eViewport.current = e; setRef(); }, [setRef]);

    const buildContainer = () => (
        <div
            className={ containerClasses }
            ref={setContainerRef}
            role={ rowCtrlsOrdered.length ? "rowgroup" : "presentation" }
        >
            {
                rowCtrlsOrdered.map(rowCtrl =>
                    <RowComp rowCtrl={ rowCtrl } containerType={ containerType } key={ rowCtrl.getInstanceId() }></RowComp>
                )
            }
        </div>
    );

    return (
        <>
            {
                centerTemplate ?
                <div className={viewportClasses} ref={setViewportRef} role="presentation">
                    { buildContainer() }
                </div> :
                buildContainer()
            }
        </>
    );
};

export default memo(RowContainerComp);
