import type { MutableRefObject } from 'react';
import { useContext, useEffect } from 'react';

import type { Context, ICellRendererComp } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import type { RenderDetails } from './cellComp';

const destroyCellRenderer = (
    context: Context,
    setJsCellRendererRef: (comp: ICellRendererComp | undefined) => void,
    getJsCellRendererRef: () => ICellRendererComp | undefined
) => {
    const comp = getJsCellRendererRef();
    if (!comp) {
        return;
    }

    const compGui = comp.getGui();

    if (compGui && compGui.parentElement) {
        compGui.parentElement.removeChild(compGui);
    }

    context.destroyBean(comp);
    setJsCellRendererRef(undefined);
};

const useJsCellRenderer = (
    showDetails: RenderDetails | undefined,
    showTools: boolean,
    eCellValue: HTMLElement | undefined | null,
    cellValueVersion: number,
    setJsCellRendererRef: (comp: ICellRendererComp | undefined) => void,
    getJsCellRendererRef: () => ICellRendererComp | undefined,
    eGui: MutableRefObject<any>
) => {
    const { context } = useContext(BeansContext);

    // create or refresh JS cell renderer
    useEffect(() => {
        const showValue = showDetails != null;
        const jsCompDetails = showDetails?.compDetails && !showDetails.compDetails.componentFromFramework;
        const waitingForToolsSetup = showTools && eCellValue == null;
        const showComp = showValue && jsCompDetails && !waitingForToolsSetup;

        // if not showing comp, destroy any existing one and return
        if (!showComp) {
            destroyCellRenderer(context, setJsCellRendererRef, getJsCellRendererRef);
            return;
        }

        const compDetails = showDetails!.compDetails;

        const comp = getJsCellRendererRef();
        if (comp) {
            // attempt refresh if refresh method exists
            const attemptRefresh = comp.refresh != null && showDetails!.force == false;
            const refreshResult = attemptRefresh ? comp.refresh(compDetails!.params) : false;
            const refreshWorked = refreshResult === true || refreshResult === undefined;

            // if refresh worked, nothing else to do
            if (refreshWorked) {
                return;
            }

            // if refresh didn't work, we destroy it and continue, so new cell renderer created below
            destroyCellRenderer(context, setJsCellRendererRef, getJsCellRendererRef);
        }

        const promise = compDetails!.newAgStackInstance();

        promise.then((comp) => {
            if (!comp) {
                return;
            }

            const compGui = comp.getGui();
            if (!compGui) {
                return;
            }

            const parent = showTools ? eCellValue! : eGui.current!;
            parent.appendChild(compGui);

            setJsCellRendererRef(comp);
        });
        // We do not return the destroy here as we want to keep the comp alive for our custom refresh approach above
    }, [
        showDetails,
        showTools,
        cellValueVersion,
        eCellValue,
        eGui,
        context,
        getJsCellRendererRef,
        setJsCellRendererRef,
    ]);

    // this effect makes sure destroyCellRenderer gets called when the
    // component is destroyed. as the other effect only updates when there
    // is a change in state
    useEffect(() => {
        return () => destroyCellRenderer(context, setJsCellRendererRef, getJsCellRendererRef);
    }, [context, getJsCellRendererRef, setJsCellRendererRef]);
};

export default useJsCellRenderer;
