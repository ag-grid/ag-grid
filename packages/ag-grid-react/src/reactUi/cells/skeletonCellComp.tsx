import type { MutableRefObject } from 'react';
import React, { useMemo, useRef } from 'react';

import type { CellCtrl, ICellRendererComp } from 'ag-grid-community';

import useJsCellRenderer from './showJsRenderer';

export const SkeletonCellRenderer = ({
    cellCtrl,
    parent,
}: {
    cellCtrl: CellCtrl;
    parent: MutableRefObject<HTMLDivElement | null>;
}) => {
    const jsCellRendererRef = useRef<ICellRendererComp>();

    const renderDetails = useMemo(() => {
        const { loadingComp } = cellCtrl.getDeferLoadingCellRenderer();
        return loadingComp
            ? {
                  value: undefined,
                  compDetails: loadingComp,
                  force: false,
              }
            : undefined;
    }, [cellCtrl]);

    // Will handle the creation and destruction of the JS cell renderer SkeletonCellRenderer
    useJsCellRenderer(renderDetails, false, undefined, 1, jsCellRendererRef, parent);

    if (renderDetails?.compDetails?.componentFromFramework) {
        // If the user has provided a React component, we render it here
        const CellRendererClass = renderDetails.compDetails.componentClass;
        return <CellRendererClass {...renderDetails.compDetails.params} />;
    }

    return <></>;
};
