import { GroupCellRendererCtrl, _ } from "@ag-grid-community/core";
import { createMemo, createSignal, onMount, useContext } from 'solid-js';
import { BeansContext } from "../core/beansContext";
import { CssClasses } from "../core/utils";
import UserComp from "../userComps/userComp";
const GroupCellRenderer = (props) => {
    const context = useContext(BeansContext).context;
    let eGui;
    let eValueRef;
    let eCheckboxRef;
    let eExpandedRef;
    let eContractedRef;
    const [getInnerCompDetails, setInnerCompDetails] = createSignal();
    const [getChildCount, setChildCount] = createSignal();
    const [getValue, setValue] = createSignal();
    const [getCssClasses, setCssClasses] = createSignal(new CssClasses());
    const [getExpandedCssClasses, setExpandedCssClasses] = createSignal(new CssClasses('ag-hidden'));
    const [getContractedCssClasses, setContractedCssClasses] = createSignal(new CssClasses('ag-hidden'));
    const [getCheckboxCssClasses, setCheckboxCssClasses] = createSignal(new CssClasses('ag-invisible'));
    props.ref(() => ({
        // force new instance when grid tries to refresh
        refresh() { return false; }
    }));
    onMount(() => {
        const compProxy = {
            setInnerRenderer: (details, valueToDisplay) => {
                setInnerCompDetails(details);
                const escapedValue = _.escapeString(valueToDisplay, true);
                setValue(escapedValue);
            },
            setChildCount: count => setChildCount(count),
            addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
            setContractedDisplayed: displayed => setContractedCssClasses(getContractedCssClasses().setClass('ag-hidden', !displayed)),
            setExpandedDisplayed: displayed => setExpandedCssClasses(getExpandedCssClasses().setClass('ag-hidden', !displayed)),
            setCheckboxVisible: visible => setCheckboxCssClasses(getCheckboxCssClasses().setClass('ag-invisible', !visible))
        };
        const ctrl = context.createBean(new GroupCellRendererCtrl());
        ctrl.init(compProxy, eGui, eCheckboxRef, eExpandedRef, eContractedRef, GroupCellRenderer, props);
        return () => { context.destroyBean(ctrl); };
    });
    const getClassName = createMemo(() => `ag-cell-wrapper ${getCssClasses().toString()}`);
    const getExpandedClassName = createMemo(() => `ag-group-expanded ${getExpandedCssClasses().toString()}`);
    const getContractedClassName = createMemo(() => `ag-group-contracted ${getContractedCssClasses().toString()}`);
    const getCheckboxClassName = createMemo(() => `ag-group-checkbox ${getCheckboxCssClasses().toString()}`);
    const isShowUserComp = () => getInnerCompDetails() != null;
    const isShowValue = () => getInnerCompDetails() == null && getValue() != null;
    return (<span class={getClassName()} ref={eGui} {...(!props.colDef ? { role: 'gridcell' } : {})}>
            <span class={getExpandedClassName()} ref={eExpandedRef}></span>
            <span class={getContractedClassName()} ref={eContractedRef}></span>
            <span class={getCheckboxClassName()} ref={eCheckboxRef}></span>
            <span class="ag-group-value" ref={eValueRef}>
                {isShowUserComp() && <UserComp compDetails={getInnerCompDetails()}></UserComp>}
                {isShowValue() && <>{getValue()}</>}
            </span>
            <span class="ag-group-child-count">{getChildCount()}</span>
        </span>);
};
// we do not memo() here, as it would stop the forwardRef working
export default GroupCellRenderer;
