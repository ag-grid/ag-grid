import { createEffect, createMemo, createSignal, onMount } from 'solid-js';
import { CssClasses } from '../core/utils';
import UserComp from '../userComps/userComp';
const HeaderGroupCellComp = (props) => {
    const [getCssClasses, setCssClasses] = createSignal(new CssClasses());
    const [getCssResizableClasses, setResizableCssClasses] = createSignal(new CssClasses());
    const [getWidth, setWidth] = createSignal();
    const [getTitle, setTitle] = createSignal();
    const [getColId, setColId] = createSignal();
    const [getAriaExpanded, setAriaExpanded] = createSignal();
    const [getUserCompDetails, setUserCompDetails] = createSignal();
    let eGui;
    let eResize;
    const { ctrl } = props;
    onMount(() => {
        const compProxy = {
            setWidth: width => setWidth(width),
            addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
            setColId: id => setColId(id),
            setTitle: title => setTitle(title),
            setUserCompDetails: compDetails => setUserCompDetails(compDetails),
            addOrRemoveResizableCssClass: (name, on) => setResizableCssClasses(prev => prev.setClass(name, on)),
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
        let userCompDomElement = undefined;
        eGui.childNodes.forEach(node => {
            if (node != null && node !== eResize) {
                userCompDomElement = node;
            }
        });
        userCompDomElement && ctrl.setDragSource(userCompDomElement);
    });
    const style = createMemo(() => ({
        width: getWidth()
    }));
    const getClassName = createMemo(() => 'ag-header-group-cell ' + getCssClasses().toString());
    const getResizableClassName = createMemo(() => 'ag-header-cell-resize ' + getCssResizableClasses().toString());
    return (<div ref={eGui} class={getClassName()} style={style()} title={getTitle()} col-id={getColId()} role="columnheader" tabIndex={-1} aria-expanded={getAriaExpanded()}>

            {getUserCompDetails()
            && <UserComp compDetails={getUserCompDetails()}/>}

            <div ref={eResize} class={getResizableClassName()}></div>
        </div>);
};
export default HeaderGroupCellComp;
