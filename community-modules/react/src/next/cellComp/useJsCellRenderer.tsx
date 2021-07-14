import React, { MutableRefObject, useEffect, useRef, useState, useCallback, RefObject, useMemo } from 'react';
import {
    Context,
    UserCompDetails,
    _,
    UserComponentFactory,
    ICellRendererComp,
} from '@ag-grid-community/core';
import { CellCompState, RenderDetails } from '../cellComp';

export function useJsCellRenderer(renderDetails: RenderDetails | undefined, 
    showTools: boolean, toolsValueSpan: HTMLElement | undefined, context: Context, 
    jsCellRendererRef: MutableRefObject<ICellRendererComp|undefined>, eGui: MutableRefObject<any>) {

        const destroyCellRenderer = useCallback( ()=> {
            const comp = jsCellRendererRef.current;
            if (!comp) { return; }

            const compGui = comp.getGui();

            if (compGui && compGui.parentElement) {
                compGui.parentElement.removeChild(compGui);
            }

            context.destroyBean(comp);
            jsCellRendererRef.current = undefined;
        }, []);

        // create or refresh JS cell renderer
        useEffect( ()=> {
            
            const showValue = renderDetails && !renderDetails.edit;
            const jsCompDetails = renderDetails && renderDetails.compDetails && !renderDetails.compDetails.componentFromFramework;
            const waitingForToolsSetup = showTools && toolsValueSpan == null;

            const showComp = showValue && jsCompDetails && !waitingForToolsSetup;

            // if not showing comp, destroy any existing one and return
            if (!showComp) {
                destroyCellRenderer();
                return;
            }

            const rendererCompDetails = renderDetails!.compDetails;

            if (jsCellRendererRef.current) {
                // attempt refresh if refresh method exists
                const comp = jsCellRendererRef.current;
                const attemptRefresh = comp.refresh != null && renderDetails!.force == false;
                const refreshResult = attemptRefresh ? comp.refresh(rendererCompDetails!.params) : false;
                const refreshWorked = refreshResult === true || refreshResult === undefined;

                // if refresh worked, nothing else to do
                if (refreshWorked) { return; }

                // if refresh didn't work, we destroy it and continue, so new cell renderer created below
                destroyCellRenderer();
            }

            const compFactory = context.getBean('userComponentFactory') as UserComponentFactory;
            const promise = compFactory.createCellRenderer(rendererCompDetails!);
            if (!promise) { return; }

            const comp = promise.resolveNow(null, x => x); // js comps are never async
            if (!comp) { return; }

            const compGui = comp.getGui();
            const parent = showTools ? toolsValueSpan! : eGui.current!;
            parent.appendChild(compGui);

            jsCellRendererRef.current = comp;

        }, [renderDetails, showTools, toolsValueSpan]);

        // this effect makes sure destroyCellRenderer gets called when the
        // component is destroyed. as the other effect only updates when there
        // is a change in state
        useEffect( ()=> {
            return destroyCellRenderer;
        }, []);
}
