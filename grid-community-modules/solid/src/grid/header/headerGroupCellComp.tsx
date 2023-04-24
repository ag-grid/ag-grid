import { HeaderGroupCellCtrl, IHeaderGroupCellComp, UserCompDetails } from '@ag-grid-community/core';
import { createEffect, createMemo, createSignal, onMount } from 'solid-js';
import { CssClasses } from '../core/utils';
import UserComp from '../userComps/userComp';

const HeaderGroupCellComp = (props: {ctrl: HeaderGroupCellCtrl}) => {

    const [getCssClasses, setCssClasses] = createSignal<CssClasses>(new CssClasses());
    const [getCssResizableClasses, setResizableCssClasses] = createSignal<CssClasses>(new CssClasses());
    const [getResizableAriaHidden, setResizableAriaHidden] = createSignal<"true" | "false">("false");
    const [getWidth, setWidth] = createSignal<string>();
    const [getTitle, setTitle] = createSignal<string>();
    const [getColId, setColId] = createSignal<string>();
    const [getAriaExpanded, setAriaExpanded] = createSignal<'true'|'false'|undefined>();
    const [getUserCompDetails, setUserCompDetails] = createSignal<UserCompDetails>();

    let eGui: HTMLDivElement;
    let eResize: HTMLDivElement;

    const { ctrl } = props;

    onMount( () => {

        const compProxy: IHeaderGroupCellComp = {
            setWidth: width => setWidth(width),
            addOrRemoveCssClass: (name, on) => setCssClasses(getCssClasses().setClass(name, on)),
            setColId: id => setColId(id),
            setTitle: title => setTitle(title),
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
    createEffect(()=> {
        const userCompDetails = getUserCompDetails();
        if (userCompDetails==null) { return; }

        let userCompDomElement: HTMLElement | undefined = undefined;
        eGui.childNodes.forEach( node => {
            if (node!=null && node!==eResize) {
                userCompDomElement = node as HTMLElement;
            }
        });

        userCompDomElement && ctrl.setDragSource(userCompDomElement);
    });

    const style = createMemo( ()=> ({
        width: getWidth()
    }));
    
    const getClassName = createMemo( ()=> 'ag-header-group-cell ' + getCssClasses().toString() );
    const getResizableClassName = createMemo( ()=> 'ag-header-cell-resize ' + getCssResizableClasses().toString() );

    return (
        <div ref={eGui!} class={getClassName()} style={style()} title={getTitle()} col-id={getColId()} 
                    role="columnheader" tabIndex={-1} aria-expanded={getAriaExpanded()}>

            { getUserCompDetails() 
                && <UserComp compDetails={getUserCompDetails()!} /> }

            <div ref={eResize!} aria-hidden={getResizableAriaHidden()} class={getResizableClassName()}></div>
        </div>
    );
};

export default HeaderGroupCellComp;