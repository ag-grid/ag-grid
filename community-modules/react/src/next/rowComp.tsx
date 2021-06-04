import React, { useEffect, useMemo, useRef, useState } from "react";
import { Context, IRowContainerComp, RowContainerCtrl, RowContainerName } from "@ag-grid-community/core";
import { classesList } from "./utils";

export function RowComp(params: {context: Context}) {

    const {context, name} = params;

    useEffect(()=> {
        const beansToDestroy: any[] = [];

        const compProxy: IRowComp = {
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

    return (
        <div/>
    );
}