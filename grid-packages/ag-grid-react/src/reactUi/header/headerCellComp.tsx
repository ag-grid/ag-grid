import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import { ColumnSortState, CssClassManager, HeaderCellCtrl, IHeader, IHeaderCellComp, UserCompDetails } from 'ag-grid-community';
import { isComponentStateless } from '../utils';
import { showJsComp } from '../jsComp';
import { useEffectOnce } from '../useEffectOnce';

const HeaderCellComp = (props: {ctrl: HeaderCellCtrl}) => {

    const { context } = useContext(BeansContext);
    const [width, setWidth] = useState<string>();
    const [title, setTitle] = useState<string>();
    const [colId, setColId] = useState<string>();
    const [ariaSort, setAriaSort] = useState<ColumnSortState>();
    const [ariaDescription, setAriaDescription] = useState<string>();
    const [userCompDetails, setUserCompDetails] = useState<UserCompDetails>();

    const eGui = useRef<HTMLDivElement>(null);
    const eResize = useRef<HTMLDivElement>(null);
    const eHeaderCompWrapper = useRef<HTMLDivElement>(null);
    const userCompRef = useRef<IHeader>();

    const { ctrl } = props;

    const cssClassManager = useMemo(() => new CssClassManager(() => eGui.current!), []);

    useEffectOnce(() => {
        const compProxy: IHeaderCellComp = {
            setWidth: width => setWidth(width),
            addOrRemoveCssClass: (name, on) => cssClassManager.addOrRemoveCssClass(name, on),
            setColId: id => setColId(id),
            setTitle: title => setTitle(title),

            setAriaDescription: description => setAriaDescription(description),
            setAriaSort: sort => setAriaSort(sort),
            setUserCompDetails: compDetails => setUserCompDetails(compDetails),
            getUserCompInstance: () => userCompRef.current || undefined
        };

        ctrl.setComp(compProxy, eGui.current!, eResize.current!, eHeaderCompWrapper.current!);

        const selectAllGui = ctrl.getSelectAllGui();
        eResize.current!.insertAdjacentElement('afterend', selectAllGui);
    });

    // js comps
    useEffect(() => showJsComp(
        userCompDetails, context, eHeaderCompWrapper.current!, userCompRef
    ), [userCompDetails]);

    // add drag handling, must be done after component is added to the dom
    useEffect(() => {
        ctrl.setDragSource(eHeaderCompWrapper.current!);
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
            aria-sort={ ariaSort }
            role="columnheader"
            tabIndex={-1}
            aria-description={ ariaDescription }
        >
            <div ref={eResize} className="ag-header-cell-resize" role="presentation"></div>
            <div ref={eHeaderCompWrapper} className="ag-header-cell-comp-wrapper" role="presentation">
            { reactUserComp && userCompStateless && <UserCompClass { ...userCompDetails!.params } /> }
            { reactUserComp && !userCompStateless && <UserCompClass { ...userCompDetails!.params } ref={ userCompRef }/> }
            </div>
        </div>
    );
};

export default memo(HeaderCellComp);
