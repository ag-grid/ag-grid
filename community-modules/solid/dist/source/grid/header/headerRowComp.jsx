import { HeaderRowType, _ } from '@ag-grid-community/core';
import { createMemo, createSignal, For, onMount, useContext } from 'solid-js';
import { BeansContext } from '../core/beansContext';
import HeaderCellComp from './headerCellComp';
import HeaderFilterCellComp from './headerFilterCellComp';
import HeaderGroupCellComp from './headerGroupCellComp';
const HeaderRowComp = (props) => {
    const { gridOptionsWrapper } = useContext(BeansContext);
    const [getTransform, setTransform] = createSignal();
    const [getHeight, setHeight] = createSignal();
    const [getTop, setTop] = createSignal();
    const [getWidth, setWidth] = createSignal();
    const [getAriaRowIndex, setAriaRowIndex] = createSignal();
    const [getCellCtrls, setCellCtrls] = createSignal([]);
    let eGui;
    const { ctrl } = props;
    const typeColumn = ctrl.getType() === HeaderRowType.COLUMN;
    const typeGroup = ctrl.getType() === HeaderRowType.COLUMN_GROUP;
    const typeFilter = ctrl.getType() === HeaderRowType.FLOATING_FILTER;
    const setCellCtrlsMaintainOrder = (next) => {
        const prev = getCellCtrls();
        // if we are ensuring dom order, we set the ctrls into the dom in the same order they appear on screen
        if (gridOptionsWrapper.isEnsureDomOrder()) {
            return next;
        }
        // if not maintaining order, we want to keep the dom elements we have and add new ones to the end,
        // otherwise we will loose transition effects as elements are placed in different dom locations
        const prevMap = _.mapById(prev, c => c.getInstanceId());
        const nextMap = _.mapById(next, c => c.getInstanceId());
        const oldCtrlsWeAreKeeping = prev.filter(c => nextMap.has(c.getInstanceId()));
        const newCtrls = next.filter(c => !prevMap.has(c.getInstanceId()));
        const nextOrderMaintained = [...oldCtrlsWeAreKeeping, ...newCtrls];
        setCellCtrls(nextOrderMaintained);
    };
    onMount(() => {
        const compProxy = {
            setTransform: transform => setTransform(transform),
            setHeight: height => setHeight(height),
            setTop: top => setTop(top),
            setHeaderCtrls: ctrls => setCellCtrlsMaintainOrder(ctrls),
            setWidth: width => setWidth(width),
            setAriaRowIndex: rowIndex => setAriaRowIndex(rowIndex)
        };
        ctrl.setComp(compProxy);
    });
    const style = createMemo(() => ({
        transform: getTransform(),
        height: getHeight(),
        top: getTop(),
        width: getWidth()
    }));
    const cssClassesList = [`ag-header-row`];
    typeColumn && cssClassesList.push(`ag-header-row-column`);
    typeGroup && cssClassesList.push(`ag-header-row-column-group`);
    typeFilter && cssClassesList.push(`ag-header-row-column-filter`);
    const cssClasses = cssClassesList.join(' ');
    const createCellJsx = (cellCtrl) => {
        switch (ctrl.getType()) {
            case HeaderRowType.COLUMN_GROUP:
                return <HeaderGroupCellComp ctrl={cellCtrl}/>;
            case HeaderRowType.FLOATING_FILTER:
                return <HeaderFilterCellComp ctrl={cellCtrl}/>;
            default:
                return <HeaderCellComp ctrl={cellCtrl}/>;
        }
    };
    // below, we are not doing floating filters, not yet
    return (<div ref={eGui} class={cssClasses} role="row" style={style()} aria-rowindex={getAriaRowIndex()}>
            <For each={getCellCtrls()}>{(cellCtrl, i) => createCellJsx(cellCtrl)}</For>
        </div>);
};
export default HeaderRowComp;
