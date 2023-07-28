import React, { useEffect, useRef, useState, useMemo, memo, useContext, useLayoutEffect, useCallback } from 'react';
import { CellCtrl, RowContainerType, IRowComp, RowCtrl, UserCompDetails, ICellRenderer, CssClassManager, RowStyle } from '@ag-grid-community/core';
import { showJsComp } from '../jsComp';
import { isComponentStateless, agFlushSync, getNextValue } from '../utils';
import { BeansContext } from '../beansContext';
import CellComp from '../cells/cellComp';

const RowComp = (params: { rowCtrl: RowCtrl, containerType: RowContainerType }) => {

    const { context } = useContext(BeansContext);
    const { rowCtrl, containerType } = params;

    const tabIndex = rowCtrl.getTabIndex();
    const domOrderRef = useRef<boolean>(rowCtrl.getDomOrder());
    const isFullWidth = rowCtrl.isFullWidth();

    const [rowIndex, setRowIndex] = useState<string>(rowCtrl.getRowIndex());
    const [rowId, setRowId] = useState<string | null>(rowCtrl.getRowId());
    const [rowBusinessKey, setRowBusinessKey] = useState<string | null>(rowCtrl.getBusinessKey());

    const [userStyles, setUserStyles] = useState<RowStyle | undefined>(rowCtrl.getRowStyles());
    const [cellCtrls, setCellCtrls] = useState<CellCtrl[] | null>(
        isFullWidth ? null : rowCtrl.getCellCtrlsForContainer(containerType));
    const [fullWidthCompDetails, setFullWidthCompDetails] = useState<UserCompDetails>();

    // these styles have initial values, so element is placed into the DOM with them,
    // rather than an transition getting applied.
    const [top, setTop] = useState<string | undefined>(rowCtrl.getInitialRowTop(containerType));
    const [transform, setTransform] = useState<string | undefined>(rowCtrl.getInitialTransform(containerType));

    const eGui = useRef<HTMLDivElement | null>(null);
    const fullWidthCompRef = useRef<ICellRenderer>();

    const autoHeightSetup = useRef<boolean>(false);
    const [autoHeightSetupAttempt, setAutoHeightSetupAttempt] = useState<number>(0);

    // puts autoHeight onto full with detail rows. this needs trickery, as we need
    // the HTMLElement for the provided Detail Cell Renderer, however the Detail Cell Renderer
    // could be a stateless React Func Comp which won't work with useRef, so we need
    // to poll (we limit to 10) looking for the Detail HTMLElement (which will be the only
    // child) after the fullWidthCompDetails is set.
    // I think this looping could be avoided if we use a ref Callback instead of useRef,
    useEffect(() => {
        if (autoHeightSetup.current) { return; }
        if (!fullWidthCompDetails) { return; }
        if (autoHeightSetupAttempt > 10) { return; }

        const eChild = eGui.current?.firstChild as HTMLElement;
        if (eChild) {
            rowCtrl.setupDetailRowAutoHeight(eChild);
            autoHeightSetup.current = true;
        } else {
            setAutoHeightSetupAttempt(prev => prev + 1);
        }

    }, [fullWidthCompDetails, autoHeightSetupAttempt]);

    const cssClassManager = useMemo(() => new CssClassManager(() => eGui.current!), []);


    // Outdated comment:
    // we use layout effect here as we want to synchronously process setComp and it's side effects
    // to ensure the component is fully initialised prior to the first browser paint. See AG-7018.

    const setRef = useCallback((e: HTMLDivElement) => {
        eGui.current = e;

        // because React is asynchronous, it's possible the RowCtrl is no longer a valid RowCtrl. This can
        // happen if user calls two API methods one after the other, with the second API invalidating the rows
        // the first call created. Thus the rows for the first call could still get created even though no longer needed.
        if (!rowCtrl.isAlive()) { return; }

        if (!eGui.current) {
            rowCtrl.unsetComp(containerType);
            return;
        }

        const compProxy: IRowComp = {
            // the rowTop is managed by state, instead of direct style manipulation by rowCtrl (like all the other styles)
            // as we need to have an initial value when it's placed into he DOM for the first time, for animation to work.
            setTop: value => setTop(value),
            setTransform: value => setTransform(value),

            // i found using React for managing classes at the row level was to slow, as modifying classes caused a lot of
            // React code to execute, so avoiding React for managing CSS Classes made the grid go much faster.
            addOrRemoveCssClass: (name, on) => cssClassManager.addOrRemoveCssClass(name, on),

            setDomOrder: domOrder => domOrderRef.current = domOrder,
            setRowIndex: value => setRowIndex(value),
            setRowId: value => setRowId(value),
            setRowBusinessKey: value => setRowBusinessKey(value),
            setUserStyles: (styles: RowStyle | undefined) => setUserStyles(styles),
            // if we don't maintain the order, then cols will be ripped out and into the dom
            // when cols reordered, which would stop the CSS transitions from working
            setCellCtrls: (next, useFlushSync) => {
                //DO we need to flushSync here anymore? Initial render has the cells in normal use case.
                // Does it change for if cell renderers are used? As they are set in second pass.
                //agFlushSync(useFlushSync, () => {
                    setCellCtrls(prev => getNextValue(prev, next, domOrderRef.current));
                //});
            },
            showFullWidth: compDetails => setFullWidthCompDetails(compDetails),
            getFullWidthCellRenderer: () => fullWidthCompRef.current,
        };
        rowCtrl.setComp(compProxy, eGui.current!, containerType);

    }, []);

    useLayoutEffect(() => showJsComp(fullWidthCompDetails, context, eGui.current!, fullWidthCompRef), [fullWidthCompDetails]);

    const rowStyles = useMemo(() => {
        const res = { top, transform };

        Object.assign(res, userStyles);
        return res;
    }, [top, transform, userStyles]);

    const showFullWidthFramework = isFullWidth && fullWidthCompDetails && fullWidthCompDetails.componentFromFramework;
    const showCells = !isFullWidth && cellCtrls != null;

    const reactFullWidthCellRendererStateless = useMemo(() => {
        const res = fullWidthCompDetails?.componentFromFramework && isComponentStateless(fullWidthCompDetails.componentClass);
        return !!res;
    }, [fullWidthCompDetails]);

    const showCellsJsx = () => cellCtrls?.map(cellCtrl => (
        <CellComp
            cellCtrl={cellCtrl}
            editingRow={rowCtrl.isEditing()}
            printLayout={rowCtrl.isPrintLayout()}
            key={cellCtrl.getInstanceId()}
        />
    ));

    const showFullWidthFrameworkJsx = () => {
        const FullWidthComp = fullWidthCompDetails!.componentClass;
        return (
            <>
                {
                    reactFullWidthCellRendererStateless
                    && <FullWidthComp  {...fullWidthCompDetails!.params} />
                }
                {
                    !reactFullWidthCellRendererStateless
                    && <FullWidthComp  {...fullWidthCompDetails!.params} ref={fullWidthCompRef} />
                }
            </>
        );
    };

    return (
        <div
            ref={setRef}
            role={'row'}
            style={rowStyles}
            row-index={rowIndex}
            row-id={rowId}
            row-business-key={rowBusinessKey}
            tabIndex={tabIndex}
        >
            {showCells && showCellsJsx()}
            {showFullWidthFramework && showFullWidthFrameworkJsx()}
        </div>
    );
};

export default memo(RowComp);
