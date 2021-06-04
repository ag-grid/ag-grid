import React, { useEffect, useMemo, useRef, useState } from "react";
import { Context, IRowContainerComp, RowContainerCtrl, RowContainerName } from "@ag-grid-community/core";
import { classesList } from "./utils";

export function RowContainerComp(params: {context: Context, name: RowContainerName}) {

    const [viewportHeight, setViewportHeight] = useState<string>('');

    const {context, name} = params;

    const cssClasses = useMemo( ()=> RowContainerCtrl.getRowContainerCssClasses(name), []);

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
            setViewportHeight: setViewportHeight
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

    return (
        <>
            {template1 &&
            <div className={ wrapperClasses } ref={ eWrapper } role="presentation" unselectable="on">
                <div className={ viewportClasses } ref= { eViewport } role="presentation" style={viewportStyle}>
                    <div className={ containerClasses } ref= { eContainer } role="rowgroup" unselectable="on"></div>
                </div>
            </div>
            }
            {template2 &&
                <div className={ viewportClasses } ref= { eViewport } role="presentation" style={viewportStyle}>
                    <div className={ containerClasses } ref= { eContainer } role="rowgroup" unselectable="on"></div>
                </div>
            }
            {template3 &&
                    <div className={ containerClasses } ref= { eContainer } role="rowgroup" unselectable="on"></div>
            }
        </>
    );
}