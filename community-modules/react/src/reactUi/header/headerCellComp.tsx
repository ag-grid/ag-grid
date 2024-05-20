import {
    ColumnSortState,
    CssClassManager,
    HeaderCellCtrl,
    IHeader,
    IHeaderCellComp,
    UserCompDetails,
    _removeAriaSort,
    _setAriaSort,
} from '@ag-grid-community/core';
import React, { memo, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { BeansContext } from '../beansContext';
import { showJsComp } from '../jsComp';
import { isComponentStateless } from '../utils';

const HeaderCellComp = (props: { ctrl: HeaderCellCtrl }) => {
    const { ctrl } = props;
    const isAlive = ctrl.isAlive();

    const { context } = useContext(BeansContext);
    const colId = isAlive ? ctrl.getColId() : undefined;
    const [userCompDetails, setUserCompDetails] = useState<UserCompDetails>();

    const eGui = useRef<HTMLDivElement | null>(null);
    const eResize = useRef<HTMLDivElement>(null);
    const eHeaderCompWrapper = useRef<HTMLDivElement>(null);
    const userCompRef = useRef<IHeader>();

    let cssClassManager = useRef<CssClassManager>();
    if (isAlive && !cssClassManager.current) {
        cssClassManager.current = new CssClassManager(() => eGui.current);
    }
    const setRef = useCallback((e: HTMLDivElement) => {
        eGui.current = e;
        if (!eGui.current || !isAlive) {
            return;
        }

        const compProxy: IHeaderCellComp = {
            setWidth: (width: string) => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            addOrRemoveCssClass: (name: string, on: boolean) => cssClassManager.current!.addOrRemoveCssClass(name, on),
            setAriaSort: (sort?: ColumnSortState) => {
                if (eGui.current) {
                    sort ? _setAriaSort(eGui.current, sort) : _removeAriaSort(eGui.current);
                }
            },
            setUserCompDetails: (compDetails: UserCompDetails) => setUserCompDetails(compDetails),
            getUserCompInstance: () => userCompRef.current || undefined,
        };

        ctrl.setComp(compProxy, eGui.current, eResize.current!, eHeaderCompWrapper.current!);

        const selectAllGui = ctrl.getSelectAllGui();
        eResize.current?.insertAdjacentElement('afterend', selectAllGui);
    }, []);

    // js comps
    useLayoutEffect(
        () => showJsComp(userCompDetails, context, eHeaderCompWrapper.current!, userCompRef),
        [userCompDetails]
    );

    // add drag handling, must be done after component is added to the dom
    useEffect(() => {
        ctrl.setDragSource(eGui.current!);
    }, [userCompDetails]);

    const userCompStateless = useMemo(() => {
        const res = userCompDetails?.componentFromFramework && isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);

    const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    const UserCompClass = userCompDetails && userCompDetails.componentClass;

    return (
        <div ref={setRef} className="ag-header-cell" col-id={colId} role="columnheader">
            <div ref={eResize} className="ag-header-cell-resize" role="presentation"></div>
            <div ref={eHeaderCompWrapper} className="ag-header-cell-comp-wrapper" role="presentation">
                {reactUserComp && userCompStateless && <UserCompClass {...userCompDetails!.params} />}
                {reactUserComp && !userCompStateless && (
                    <UserCompClass {...userCompDetails!.params} ref={userCompRef} />
                )}
            </div>
        </div>
    );
};

export default memo(HeaderCellComp);
