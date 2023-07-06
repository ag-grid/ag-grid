// ag-grid-react v30.0.4
import React, { useEffect, useRef, useState, useMemo, memo, useContext, useLayoutEffect } from 'react';
import { CssClassManager } from 'ag-grid-community';
import { showJsComp } from '../jsComp.mjs';
import { isComponentStateless, agFlushSync } from '../utils.mjs';
import { BeansContext } from '../beansContext.mjs';
import CellComp from '../cells/cellComp.mjs';
import { useLayoutEffectOnce } from '../useEffectOnce.mjs';
const maintainOrderOnColumns = (prev, next, domOrder) => {
    if (domOrder) {
        const res = { list: next, instanceIdMap: new Map() };
        next.forEach(c => res.instanceIdMap.set(c.getInstanceId(), c));
        return res;
    }
    // if dom order not important, we don't want to change the order
    // of the elements in the dom, as this would break transition styles
    const oldCellCtrls = [];
    const newCellCtrls = [];
    const newInstanceIdMap = new Map();
    const tempMap = new Map();
    next.forEach(c => tempMap.set(c.getInstanceId(), c));
    prev.list.forEach(c => {
        const instanceId = c.getInstanceId();
        if (tempMap.has(instanceId)) {
            oldCellCtrls.push(c);
            newInstanceIdMap.set(instanceId, c);
        }
    });
    next.forEach(c => {
        const instanceId = c.getInstanceId();
        if (!prev.instanceIdMap.has(instanceId)) {
            newCellCtrls.push(c);
            newInstanceIdMap.set(instanceId, c);
        }
    });
    const res = {
        list: [...oldCellCtrls, ...newCellCtrls],
        instanceIdMap: newInstanceIdMap
    };
    return res;
};
const RowComp = (params) => {
    const { context } = useContext(BeansContext);
    const { rowCtrl, containerType } = params;
    const [rowIndex, setRowIndex] = useState();
    const [rowId, setRowId] = useState();
    const [role, setRole] = useState();
    const [rowBusinessKey, setRowBusinessKey] = useState();
    const [tabIndex, setTabIndex] = useState();
    const [userStyles, setUserStyles] = useState();
    const [cellCtrls, setCellCtrls] = useState({ list: [], instanceIdMap: new Map() });
    const [fullWidthCompDetails, setFullWidthCompDetails] = useState();
    const [domOrder, setDomOrder] = useState(false);
    // these styles have initial values, so element is placed into the DOM with them,
    // rather than an transition getting applied.
    const [top, setTop] = useState(rowCtrl.getInitialRowTop(containerType));
    const [transform, setTransform] = useState(rowCtrl.getInitialTransform(containerType));
    const eGui = useRef(null);
    const fullWidthCompRef = useRef();
    const autoHeightSetup = useRef(false);
    const [autoHeightSetupAttempt, setAutoHeightSetupAttempt] = useState(0);
    // puts autoHeight onto full with detail rows. this needs trickery, as we need
    // the HTMLElement for the provided Detail Cell Renderer, however the Detail Cell Renderer
    // could be a stateless React Func Comp which won't work with useRef, so we need
    // to poll (we limit to 10) looking for the Detail HTMLElement (which will be the only
    // child) after the fullWidthCompDetails is set.
    useEffect(() => {
        var _a;
        if (autoHeightSetup.current) {
            return;
        }
        if (!fullWidthCompDetails) {
            return;
        }
        if (autoHeightSetupAttempt > 10) {
            return;
        }
        const eChild = (_a = eGui.current) === null || _a === void 0 ? void 0 : _a.firstChild;
        if (eChild) {
            rowCtrl.setupDetailRowAutoHeight(eChild);
            autoHeightSetup.current = true;
        }
        else {
            setAutoHeightSetupAttempt(prev => prev + 1);
        }
    }, [fullWidthCompDetails, autoHeightSetupAttempt]);
    const cssClassManager = useMemo(() => new CssClassManager(() => eGui.current), []);
    // we use layout effect here as we want to synchronously process setComp and it's side effects
    // to ensure the component is fully initialised prior to the first browser paint. See AG-7018.
    useLayoutEffectOnce(() => {
        // because React is asynchronous, it's possible the RowCtrl is no longer a valid RowCtrl. This can
        // happen if user calls two API methods one after the other, with the second API invalidating the rows
        // the first call created. Thus the rows for the first call could still get created even though no longer needed.
        if (!rowCtrl.isAlive()) {
            return;
        }
        const compProxy = {
            // the rowTop is managed by state, instead of direct style manipulation by rowCtrl (like all the other styles)
            // as we need to have an initial value when it's placed into he DOM for the first time, for animation to work.
            setTop: value => setTop(value),
            setTransform: value => setTransform(value),
            // i found using React for managing classes at the row level was to slow, as modifying classes caused a lot of
            // React code to execute, so avoiding React for managing CSS Classes made the grid go much faster.
            addOrRemoveCssClass: (name, on) => cssClassManager.addOrRemoveCssClass(name, on),
            setDomOrder: domOrder => setDomOrder(domOrder),
            setRowIndex: value => setRowIndex(value),
            setRowId: value => setRowId(value),
            setRowBusinessKey: value => setRowBusinessKey(value),
            setTabIndex: value => setTabIndex(value),
            setUserStyles: (styles) => setUserStyles(styles),
            setRole: value => setRole(value),
            // if we don't maintain the order, then cols will be ripped out and into the dom
            // when cols reordered, which would stop the CSS transitions from working
            setCellCtrls: (next, useFlushSync) => {
                agFlushSync(useFlushSync, () => {
                    setCellCtrls(prev => maintainOrderOnColumns(prev, next, domOrder));
                });
            },
            showFullWidth: compDetails => setFullWidthCompDetails(compDetails),
            getFullWidthCellRenderer: () => fullWidthCompRef.current,
        };
        rowCtrl.setComp(compProxy, eGui.current, containerType);
        return () => {
            rowCtrl.unsetComp(containerType);
        };
    });
    useLayoutEffect(() => showJsComp(fullWidthCompDetails, context, eGui.current, fullWidthCompRef), [fullWidthCompDetails]);
    const rowStyles = useMemo(() => {
        const res = { top, transform };
        Object.assign(res, userStyles);
        return res;
    }, [top, transform, userStyles]);
    const showFullWidthFramework = fullWidthCompDetails && fullWidthCompDetails.componentFromFramework;
    const showCells = cellCtrls != null;
    const reactFullWidthCellRendererStateless = useMemo(() => {
        const res = (fullWidthCompDetails === null || fullWidthCompDetails === void 0 ? void 0 : fullWidthCompDetails.componentFromFramework) && isComponentStateless(fullWidthCompDetails.componentClass);
        return !!res;
    }, [fullWidthCompDetails]);
    const showCellsJsx = () => cellCtrls.list.map(cellCtrl => (React.createElement(CellComp, { cellCtrl: cellCtrl, editingRow: rowCtrl.isEditing(), printLayout: rowCtrl.isPrintLayout(), key: cellCtrl.getInstanceId() })));
    const showFullWidthFrameworkJsx = () => {
        const FullWidthComp = fullWidthCompDetails.componentClass;
        return (React.createElement(React.Fragment, null,
            reactFullWidthCellRendererStateless
                && React.createElement(FullWidthComp, Object.assign({}, fullWidthCompDetails.params)),
            !reactFullWidthCellRendererStateless
                && React.createElement(FullWidthComp, Object.assign({}, fullWidthCompDetails.params, { ref: fullWidthCompRef }))));
    };
    return (React.createElement("div", { ref: eGui, role: role, style: rowStyles, "row-index": rowIndex, "row-id": rowId, "row-business-key": rowBusinessKey, tabIndex: tabIndex },
        showCells && showCellsJsx(),
        showFullWidthFramework && showFullWidthFrameworkJsx()));
};
export default memo(RowComp);
