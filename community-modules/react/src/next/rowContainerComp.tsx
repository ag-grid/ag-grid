import React, { useEffect, useMemo, useRef, useState } from "react";
import { Context, IRowContainerComp, RowContainerCtrl, RowContainerName, RowCtrl } from "@ag-grid-community/core";
import { classesList } from "./utils";
import { RowComp } from "./rowComp";

export function RowContainerComp(params: {context: Context, name: RowContainerName}) {

    const [viewportHeight, setViewportHeight] = useState<string>('');
    const [rowCtrls, setRowCtrls] = useState<RowCtrl[]>([]);
    const [domOrder, setDomOrder] = useState<boolean>(false);
    const [containerWidth, setContainerWidth] = useState<string>('');

    const {context, name} = params;

    const cssClasses = useMemo( ()=> RowContainerCtrl.getRowContainerCssClasses(name), []);
    const pinned = useMemo( ()=> RowContainerCtrl.getPinned(name), []);

    const template1 = name === RowContainerName.CENTER;
    const template2 = name === RowContainerName.TOP_CENTER || name === RowContainerName.BOTTOM_CENTER;
    const template3 = !template1 && !template2;

    const eWrapper = useRef<HTMLDivElement>(null);
    const eViewport = useRef<HTMLDivElement>(null);
    const eContainer = useRef<HTMLDivElement>(null);

    const wrapperClasses = classesList(cssClasses.wrapper);
    const viewportClasses = classesList(cssClasses.viewport);
    const containerClasses = classesList(cssClasses.container);

    useEffect(()=> {
        const beansToDestroy: any[] = [];

        const compProxy: IRowContainerComp = {
            setViewportHeight: setViewportHeight,
            setRowCtrls: rowCtrls => {
                setRowCtrls( prev => {
                    if (domOrder) {
                        return rowCtrls;
                    } else {
                        // if dom order not important, we don't want to change the order
                        // of the elements in the dom, as this would break transition styls
                        const oldRows = prev.filter( r => rowCtrls.indexOf(r) >= 0);
                        const newRows = rowCtrls.filter( r => oldRows.indexOf(r) < 0);
                        const next = [...oldRows, ...newRows];
                        return next;
                    }
                });
            },
            setDomOrder: domOrder => setDomOrder(domOrder),
            setContainerWidth: width => setContainerWidth(width)
        };

        const ctrl = context.createBean(new RowContainerCtrl(name));
        beansToDestroy.push(ctrl);
        ctrl.setComp(compProxy, eContainer.current!, eViewport.current!, eWrapper.current!);

        return ()=> {
            beansToDestroy.forEach( b => context.destroyBean(b) );
            // destroyFuncs.forEach( f => f() );
        };

    }, []);

    const viewportStyle = {
        height: viewportHeight
    };

    const containerStyle = {
        width: containerWidth
    };

    const buildContainer = () => (
        <div className={ containerClasses } ref={ eContainer } role="rowgroup" style={containerStyle}
             unselectable="on">
            {
                rowCtrls.map( rowCtrl => <RowComp context={context} rowCtrl={rowCtrl} pinned={pinned} key={rowCtrl.getInstanceId()}></RowComp> )
            }
        </div>
    );

    return (
        <>
            {
                template1 &&
                <div className={ wrapperClasses } ref={ eWrapper } role="presentation" unselectable="on">
                    <div className={ viewportClasses } ref= { eViewport } role="presentation" style={viewportStyle}>
                        { buildContainer() }
                    </div>
                </div>
            }
            {
                template2 &&
                <div className={ viewportClasses } ref= { eViewport } role="presentation" style={viewportStyle}>
                    { buildContainer() }
                </div>
            }
            {
                template3 && buildContainer()
            }
        </>
    );
}