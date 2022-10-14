import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import { AgPromise, HeaderFilterCellCtrl, ResolveAndRejectCallback, IFloatingFilter, IHeaderFilterCellComp, UserCompDetails } from '@ag-grid-community/core';
import { CssClasses, isComponentStateless } from '../utils';
import { showJsComp } from '../jsComp';
import { useEffectOnce } from '../useEffectOnce';

const HeaderFilterCellComp = (props: {ctrl: HeaderFilterCellCtrl}) => {

    const {context} = useContext(BeansContext);

    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses('ag-header-cell', 'ag-floating-filter'));
    const [cssBodyClasses, setBodyCssClasses] = useState<CssClasses>(new CssClasses());
    const [cssButtonWrapperClasses, setButtonWrapperCssClasses] = useState<CssClasses>(new CssClasses('ag-floating-filter-button', 'ag-hidden'));
    const [width, setWidth] = useState<string>();
    const [userCompDetails, setUserCompDetails] = useState<UserCompDetails>();

    const eGui = useRef<HTMLDivElement>(null);
    const eFloatingFilterBody = useRef<HTMLDivElement>(null);
    const eButtonWrapper = useRef<HTMLDivElement>(null);
    const eButtonShowMainFilter = useRef<HTMLButtonElement>(null);

    const alreadyResolved = useRef<boolean>(false);
    const userCompResolve = useRef<(value: IFloatingFilter)=>void>();  
    const userCompPromise = useRef<AgPromise<IFloatingFilter>>();
    useEffectOnce( ()=> {
        userCompPromise.current = new AgPromise<IFloatingFilter>( resolve => {
            userCompResolve.current = resolve;
        });
    });
    
    const userCompRef = (value: IFloatingFilter) => {
        // i don't know why, but react was calling this method multiple
        // times, thus un-setting, them immediately setting the reference again.
        // because we are resolving a promise, it's not good to be resolving
        // the promise multiple times, so we only resolve the first time.
        if (alreadyResolved.current) { return; }
        // we also skip when it's un-setting
        if (value==null) { return; }

        userCompResolve.current && userCompResolve.current(value);
        alreadyResolved.current = true;
    };

    const { ctrl } = props;

    useEffectOnce(() => {

        const compProxy: IHeaderFilterCellComp = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            addOrRemoveBodyCssClass: (name, on) => setBodyCssClasses(prev => prev.setClass(name, on)),
            addOrRemoveButtonWrapperCssClass: (name, on) => setButtonWrapperCssClasses(prev => prev.setClass(name, on)),
            setWidth: width => setWidth(width),
            setCompDetails: compDetails => setUserCompDetails(compDetails),
            getFloatingFilterComp: ()=> userCompPromise.current ? userCompPromise.current :  null,
            setMenuIcon: eIcon => eButtonShowMainFilter.current!.appendChild(eIcon)
        };

        ctrl.setComp(compProxy, eGui.current!, eButtonShowMainFilter.current!, eFloatingFilterBody.current!);

    });

    // js comps
    useEffect(() => {
        return showJsComp(userCompDetails, context, eFloatingFilterBody.current!, userCompRef);
    }, [userCompDetails]);

    const style = useMemo(() => ({
        width: width
    }), [width]);
    
    const className = useMemo(() => cssClasses.toString(), [cssClasses] );
    const bodyClassName = useMemo(() => cssBodyClasses.toString(), [cssBodyClasses] );
    const buttonWrapperClassName = useMemo(() => cssButtonWrapperClasses.toString(), [cssButtonWrapperClasses] );

    const userCompStateless = useMemo(() => {
        const res = userCompDetails 
                    && userCompDetails.componentFromFramework 
                    && isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);

    const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    const UserCompClass = userCompDetails && userCompDetails.componentClass;

    return (
        <div ref={eGui} className={className} style={style} role="gridcell" tabIndex={-1}>
            <div ref={eFloatingFilterBody} className={bodyClassName} role="presentation">
                { reactUserComp && userCompStateless && <UserCompClass { ...userCompDetails!.params } /> }
                { reactUserComp && !userCompStateless && <UserCompClass { ...userCompDetails!.params } ref={ userCompRef }/> }
            </div>
            <div ref={eButtonWrapper} className={buttonWrapperClassName} role="presentation">
                <button ref={eButtonShowMainFilter} type="button" aria-label="Open Filter Menu" className="ag-floating-filter-button-button" tabIndex={-1}></button>
            </div>
        </div>
    );
};

export default memo(HeaderFilterCellComp);