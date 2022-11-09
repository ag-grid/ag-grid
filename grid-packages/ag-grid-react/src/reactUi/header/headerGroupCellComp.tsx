import { HeaderGroupCellCtrl, IHeaderGroupCellComp, UserCompDetails } from 'ag-grid-community';
import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import { showJsComp } from '../jsComp';
import { useEffectOnce } from '../useEffectOnce';
import { CssClasses } from '../utils';

const HeaderGroupCellComp = (props: {ctrl: HeaderGroupCellCtrl}) => {

    const {context} = useContext(BeansContext);

    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [cssResizableClasses, setResizableCssClasses] = useState<CssClasses>(new CssClasses());
    const [resizableAriaHidden, setResizableAriaHidden] = useState<"true" | "false">("false");
    const [width, setWidth] = useState<string>();
    const [title, setTitle] = useState<string>();
    const [colId, setColId] = useState<string>();
    const [ariaExpanded, setAriaExpanded] = useState<'true'|'false'|undefined>();
    const [userCompDetails, setUserCompDetails] = useState<UserCompDetails>();

    const eGui = useRef<HTMLDivElement>(null);
    const eResize = useRef<HTMLDivElement>(null);

    const { ctrl } = props;

    useEffectOnce(() => {

        const compProxy: IHeaderGroupCellComp = {
            setWidth: width => setWidth(width),
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setColId: id => setColId(id),
            setTitle: title => setTitle(title),
            setUserCompDetails: compDetails => setUserCompDetails(compDetails),
            setResizableDisplayed: (displayed) => {
                setResizableCssClasses(prev => prev.setClass('ag-hidden', !displayed))
                setResizableAriaHidden(!displayed ? "true" : "false");
            },
            setAriaExpanded: expanded => setAriaExpanded(expanded)
        };

        ctrl.setComp(compProxy, eGui.current!, eResize.current!);

    });

    // js comps
    useEffect(() => {
        return showJsComp(userCompDetails, context, eGui.current!);
    }, [userCompDetails]);

    // add drag handling, must be done after component is added to the dom
    useEffect(()=> {
        let userCompDomElement: HTMLElement | undefined = undefined;
        eGui.current!.childNodes.forEach( node => {
            if (node!=null && node!==eResize.current) {
                userCompDomElement = node as HTMLElement;
            }
        });

        userCompDomElement && ctrl.setDragSource(userCompDomElement);
    }, [userCompDetails]);

    const style = useMemo( ()=> ({
        width: width
    }), [width]);
    
    const className = useMemo( ()=> 'ag-header-group-cell ' + cssClasses.toString(), [cssClasses] );
    const resizableClassName = useMemo( ()=> 'ag-header-cell-resize ' + cssResizableClasses.toString(), [cssResizableClasses] );

    const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    const UserCompClass = userCompDetails && userCompDetails.componentClass;

    return (
        <div ref={eGui} className={className} style={style} title={title} col-id={colId} 
                    role="columnheader" tabIndex={-1} aria-expanded={ariaExpanded}>
            { reactUserComp && <UserCompClass { ...userCompDetails!.params } /> }
            <div ref={eResize} aria-hidden={resizableAriaHidden} className={resizableClassName}></div>
        </div>
    );
};

export default memo(HeaderGroupCellComp);