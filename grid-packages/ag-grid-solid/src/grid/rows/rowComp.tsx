import { CellCtrl, CssClassManager, ICellRenderer, IRowComp, RowContainerType, RowCtrl, UserCompDetails } from 'ag-grid-community';
import { createEffect, createMemo, createSignal, For, onCleanup, onMount } from "solid-js";
import CellComp from '../cells/cellComp';
import UserComp from '../userComps/userComp';

interface CellCtrls {
    list: CellCtrl[],
    instanceIdMap: Map<string, CellCtrl>
}

const maintainOrderOnColumns = (prev: CellCtrls, next: CellCtrl[], domOrder: boolean): CellCtrls => {
    if (domOrder) {
        const res: CellCtrls = { list: next, instanceIdMap: new Map() };
        next.forEach(c => res.instanceIdMap.set(c.getInstanceId(), c));

        return res;
    }

    // if dom order not important, we don't want to change the order
    // of the elements in the dom, as this would break transition styles
    const oldCellCtrls: CellCtrl[] = [];
    const newCellCtrls: CellCtrl[] = [];
    const newInstanceIdMap: Map<string, CellCtrl> = new Map();
    const tempMap: Map<string, CellCtrl> = new Map();

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

    const res: CellCtrls = {
        list: [...oldCellCtrls, ...newCellCtrls],
        instanceIdMap: newInstanceIdMap
    };

    return res;
}

const RowComp = (params: {rowCtrl: RowCtrl, containerType: RowContainerType}) => {

    const { rowCtrl, containerType } = params;

    const [getRowIndex, setRowIndex] = createSignal<string>();
    const [getRowId, setRowId] = createSignal<string>();
    const [getRole, setRole] = createSignal<string>();
    const [getRowBusinessKey, setRowBusinessKey] = createSignal<string>();
    const [getTabIndex, setTabIndex] = createSignal<number>();
    const [getUserStyles, setUserStyles] = createSignal<any>();
    const [getCellCtrls, setCellCtrls] = createSignal<CellCtrls>({ list: [], instanceIdMap: new Map() });
    const [getFullWidthCompDetails, setFullWidthCompDetails] = createSignal<UserCompDetails>();
    const [getDomOrder, setDomOrder] = createSignal<boolean>(false);

    // these styles have initial values, so element is placed into the DOM with them,
    // rather than an transition getting applied.
    const [getTop, setTop] = createSignal<string | undefined>(rowCtrl.getInitialRowTop());
    const [getTransform, setTransform] = createSignal<string | undefined>(rowCtrl.getInitialTransform());

    let eGui: HTMLDivElement;
    let fullWidthCompRef: ICellRenderer;

    const setFullWidthRef = (newRef: ICellRenderer)=> {
        fullWidthCompRef = newRef;
    };

    createEffect(() => {
        const compDetails = getFullWidthCompDetails();
        if (!compDetails) { return; }

        let tryCount = 0;

        // puts autoHeight onto full with detail rows. this needs trickery, as we need
        // the HTMLElement for the provided Detail Cell Renderer. this pattern was copied
        // from React, it's possible it's not needed here, however given it's hard to be
        // sure on Solid's async behavious, keeping the patter here.
        const trySetup = ()=> {
            const eChild = eGui.firstChild as HTMLElement;
            if (eChild) {
                rowCtrl.setupDetailRowAutoHeight(eChild);
                return;
            }

            if (tryCount>=10) { return; }

            tryCount++;
            setTimeout(trySetup, 0);
        };

        trySetup();
    });

    onMount(() => {
        // because React is asychronous, it's possible the RowCtrl is no longer a valid RowCtrl. This can
        // happen if user calls two API methods one after the other, with the second API invalidating the rows
        // the first call created. Thus the rows for the first call could still get created even though no longer needed.
        if (!rowCtrl.isAlive()) {  return; }

        const cssClassManager = new CssClassManager(() => eGui);

        const compProxy: IRowComp = {
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
            setUserStyles: styles => setUserStyles(styles),
            setRole: value => setRole(value),
            // if we don't maintain the order, then cols will be ripped out and into the dom
            // when cols reordered, which would stop the CSS transitions from working
            setCellCtrls: next => setCellCtrls(maintainOrderOnColumns(getCellCtrls(), next, getDomOrder())),
            showFullWidth: compDetails => setFullWidthCompDetails(compDetails),
            getFullWidthCellRenderer: ()=> fullWidthCompRef,
        };
        rowCtrl.setComp(compProxy, eGui, containerType);
        onCleanup(() => rowCtrl.unsetComp(containerType));
    });


    const getRowStyles = createMemo(() => {
        const res = { 
            top: getTop(), 
            transform: getTransform(),
        };

        Object.assign(res, getUserStyles());
        return res;
    });

    const isShowCells = createMemo( ()=> getCellCtrls()!=null );
    const isShowFullWidth = createMemo( ()=> getFullWidthCompDetails()!=null );

    const showCellsJsx = ()=> (
            <For each={getCellCtrls().list}>{ cellCtrl =>
                <CellComp
                        cellCtrl={ cellCtrl }
                        editingRow={ rowCtrl.isEditing() }
                        printLayout={ rowCtrl.isPrintLayout() }
                    />
            }</For>
    );

    const showFullWidthJsx = ()=> (
        <UserComp compDetails={ getFullWidthCompDetails()! } ref={setFullWidthRef}/>
    );

    return (
        <div
            ref={ eGui! }
            // role={ role() } /// FIXME
            style={ getRowStyles() }
            row-index={ getRowIndex() }
            row-id={ getRowId() }
            row-business-key={ getRowBusinessKey() }
            tabIndex={ getTabIndex() }
        >
            { isShowFullWidth() && showFullWidthJsx() }
            { isShowCells() && showCellsJsx() }

        </div>
    );
};

export default RowComp;
