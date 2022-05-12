import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import { ColumnSortState, CssClassManager, HeaderCellCtrl, IHeader, IHeaderCellComp, UserCompDetails } from '@ag-grid-community/core';
import { isComponentStateless } from '../utils';
import { showJsComp } from '../jsComp';
import { useEffectOnce } from '../useEffectOnce';

const HeaderCellComp = (props: {ctrl: HeaderCellCtrl}) => {

    const { context } = useContext(BeansContext);
    const [width, setWidth] = useState<string>();
    const [title, setTitle] = useState<string>();
    const [colId, setColId] = useState<string>();
    const [ariaSort, setAriaSort] = useState<ColumnSortState>();
    const [ariaLabel, setAriaLabel] = useState<string>();
    const [ariaDescribedBy, setAriaDescribedBy] = useState<string>();
    const [userCompDetails, setUserCompDetails] = useState<UserCompDetails>();

    const eGui = useRef<HTMLDivElement>(null);
    const eResize = useRef<HTMLDivElement>(null);
    const userCompRef = useRef<IHeader>();

    const { ctrl } = props;

    const cssClassManager = useMemo(() => new CssClassManager(() => eGui.current!), []);

    useEffectOnce(() => {
        const compProxy: IHeaderCellComp = {
            setWidth: width => setWidth(width),
            addOrRemoveCssClass: (name, on) => cssClassManager.addOrRemoveCssClass(name, on),
            setColId: id => setColId(id),
            setTitle: title => setTitle(title),
            setAriaLabel: label => setAriaLabel(label),
            setAriaDescribedBy: value => setAriaDescribedBy(value),
            setAriaSort: sort => setAriaSort(sort),
            setUserCompDetails: compDetails => setUserCompDetails(compDetails),
            getUserCompInstance: ()=> userCompRef.current || undefined
        };

        ctrl.setComp(compProxy, eGui.current!, eResize.current!);

        const selectAllGui = ctrl.getSelectAllGui();
        eResize.current!.insertAdjacentElement('afterend', selectAllGui);
    }, 'headerCell.main');

    // js comps
    useEffect(() => showJsComp(
        userCompDetails, context, eGui.current!, userCompRef
    ), [userCompDetails]);

    // add drag handling, must be done after component is added to the dom
    useEffect(() => {
        let userCompDomElement: HTMLElement | undefined = undefined;
        eGui.current!.childNodes.forEach( node => {
            if (node != null && node !== eResize.current) {
                userCompDomElement = node as HTMLElement;
            }
        });

        ctrl.setDragSource(userCompDomElement);
    }, [userCompDetails]);

    const style = useMemo(() => ({ width }), [width]);

    const userCompStateless = useMemo(() => {
        const res = userCompDetails?.componentFromFramework && isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);

    const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    const UserCompClass = userCompDetails && userCompDetails.componentClass;

    return (
        <div
            ref={eGui}
            className="ag-header-cell"
            style={ style }
            title={ title }
            col-id={ colId }
            aria-sort={ariaSort}
            role="columnheader"
            tabIndex={-1}
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
        >
            <div ref={eResize} className="ag-header-cell-resize" role="presentation"></div>
            { reactUserComp && userCompStateless && <UserCompClass { ...userCompDetails!.params } /> }
            { reactUserComp && !userCompStateless && <UserCompClass { ...userCompDetails!.params } ref={ userCompRef }/> }
        </div>
    );
};

export default memo(HeaderCellComp);
