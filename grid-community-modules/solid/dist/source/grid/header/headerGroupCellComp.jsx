import { createEffect, createMemo, createSignal, onMount } from 'solid-js';
import { CssClasses } from '../core/utils';
import UserComp from '../userComps/userComp';
const HeaderGroupCellComp = (props) => {
    const { ctrl } = props;
    const [getCssClasses, setCssClasses] = createSignal(new CssClasses());
    const [getCssResizableClasses, setResizableCssClasses] = createSignal(new CssClasses());
    const [getResizableAriaHidden, setResizableAriaHidden] = createSignal("false");
    const [getWidth, setWidth] = createSignal();
    const [getColId, setColId] = createSignal(ctrl.getColId());
    const [getAriaExpanded, setAriaExpanded] = createSignal();
    const [getUserCompDetails, setUserCompDetails] = createSignal();
    let eGui;
    let eResize;
    onMount(() => {
        const compProxy = {
            setWidth: width => setWidth(width),
            addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
            setUserCompDetails: compDetails => setUserCompDetails(compDetails),
            setResizableDisplayed: (displayed) => {
                setResizableCssClasses(prev => prev.setClass('ag-hidden', !displayed));
                setResizableAriaHidden(!displayed ? "true" : "false");
            },
            setAriaExpanded: expanded => setAriaExpanded(expanded)
        };
        ctrl.setComp(compProxy, eGui, eResize);
    });
    // add drag handling, must be done after component is added to the dom
    createEffect(() => {
        const userCompDetails = getUserCompDetails();
        if (userCompDetails == null) {
            return;
        }
        ctrl.setDragSource(eGui);
    });
    const style = createMemo(() => ({
        width: getWidth()
    }));
    const getClassName = createMemo(() => 'ag-header-group-cell ' + getCssClasses().toString());
    const getResizableClassName = createMemo(() => 'ag-header-cell-resize ' + getCssResizableClasses().toString());
    return (<div ref={eGui} class={getClassName()} style={style()} col-id={getColId()} role="columnheader" tabIndex={-1} aria-expanded={getAriaExpanded()}>

            {getUserCompDetails()
            && <UserComp compDetails={getUserCompDetails()}/>}

            <div ref={eResize} aria-hidden={getResizableAriaHidden()} class={getResizableClassName()}></div>
        </div>);
};
export default HeaderGroupCellComp;
