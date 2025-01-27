import React, { memo, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type {
    HeaderFilterCellCtrl,
    HeaderStyle,
    IFloatingFilter,
    IHeaderFilterCellComp,
    UserCompDetails,
} from 'ag-grid-community';
import { AgPromise, _EmptyBean } from 'ag-grid-community';

import { CustomContext } from '../../shared/customComp/customContext';
import { FloatingFilterComponentProxy } from '../../shared/customComp/floatingFilterComponentProxy';
import type { CustomFloatingFilterCallbacks } from '../../shared/customComp/interfaces';
import { warnReactiveCustomComponents } from '../../shared/customComp/util';
import { BeansContext } from '../beansContext';
import { showJsComp } from '../jsComp';
import { CssClasses, isComponentStateless } from '../utils';

const HeaderFilterCellComp = ({ ctrl }: { ctrl: HeaderFilterCellCtrl }) => {
    const { context, gos } = useContext(BeansContext);

    const [userStyles, setUserStyles] = useState<HeaderStyle>();

    const [cssClasses, setCssClasses] = useState<CssClasses>(
        () => new CssClasses('ag-header-cell', 'ag-floating-filter')
    );
    const [cssBodyClasses, setBodyCssClasses] = useState<CssClasses>(() => new CssClasses());
    const [cssButtonWrapperClasses, setButtonWrapperCssClasses] = useState<CssClasses>(
        () => new CssClasses('ag-floating-filter-button', 'ag-hidden')
    );
    const [buttonWrapperAriaHidden, setButtonWrapperAriaHidden] = useState<'true' | 'false'>('false');
    const [userCompDetails, setUserCompDetails] = useState<UserCompDetails | null>();
    const [, setRenderKey] = useState<number>(1);

    const compBean = useRef<_EmptyBean>();
    const eGui = useRef<HTMLDivElement | null>(null);
    const eFloatingFilterBody = useRef<HTMLDivElement>(null);
    const eButtonWrapper = useRef<HTMLDivElement>(null);
    const eButtonShowMainFilter = useRef<HTMLButtonElement>(null);

    const userCompResolve = useRef<(value: IFloatingFilter) => void>();
    const userCompPromise = useRef<AgPromise<IFloatingFilter>>();

    const userCompRef = (value: IFloatingFilter) => {
        // We skip when it's un-setting
        if (value == null) {
            return;
        }

        userCompResolve.current && userCompResolve.current(value);
    };

    const setRef = useCallback((eRef: HTMLDivElement | null) => {
        eGui.current = eRef;
        compBean.current = eRef ? context.createBean(new _EmptyBean()) : context.destroyBean(compBean.current);
        if (!eRef) {
            return;
        }

        userCompPromise.current = new AgPromise<IFloatingFilter>((resolve) => {
            userCompResolve.current = resolve;
        });

        const compProxy: IHeaderFilterCellComp = {
            addOrRemoveCssClass: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
            setUserStyles: (styles: HeaderStyle) => setUserStyles(styles),
            addOrRemoveBodyCssClass: (name, on) => setBodyCssClasses((prev) => prev.setClass(name, on)),
            setButtonWrapperDisplayed: (displayed) => {
                setButtonWrapperCssClasses((prev) => prev.setClass('ag-hidden', !displayed));
                setButtonWrapperAriaHidden(!displayed ? 'true' : 'false');
            },
            setWidth: (width) => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            setCompDetails: (compDetails) => setUserCompDetails(compDetails),
            getFloatingFilterComp: () => (userCompPromise.current ? userCompPromise.current : null),
            setMenuIcon: (eIcon) => eButtonShowMainFilter.current?.appendChild(eIcon),
        };

        ctrl.setComp(compProxy, eRef, eButtonShowMainFilter.current!, eFloatingFilterBody.current!, compBean.current);
    }, []);

    // js comps
    useLayoutEffect(
        () => showJsComp(userCompDetails, context, eFloatingFilterBody.current!, userCompRef),
        [userCompDetails]
    );

    const className = useMemo(() => cssClasses.toString(), [cssClasses]);
    const bodyClassName = useMemo(() => cssBodyClasses.toString(), [cssBodyClasses]);
    const buttonWrapperClassName = useMemo(() => cssButtonWrapperClasses.toString(), [cssButtonWrapperClasses]);

    const userCompStateless = useMemo(() => {
        const res =
            userCompDetails &&
            userCompDetails.componentFromFramework &&
            isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);

    const reactiveCustomComponents = useMemo(() => gos.get('reactiveCustomComponents'), []);
    const floatingFilterCompProxy = useMemo(() => {
        if (userCompDetails) {
            if (reactiveCustomComponents) {
                const compProxy = new FloatingFilterComponentProxy(userCompDetails!.params, () =>
                    setRenderKey((prev) => prev + 1)
                );
                userCompRef(compProxy);
                return compProxy;
            } else if (userCompDetails.componentFromFramework) {
                warnReactiveCustomComponents();
            }
        }
        return undefined;
    }, [userCompDetails]);
    const floatingFilterProps = floatingFilterCompProxy?.getProps();

    const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    const UserCompClass = userCompDetails && userCompDetails.componentClass;

    return (
        <div ref={setRef} style={userStyles} className={className} role="gridcell">
            <div ref={eFloatingFilterBody} className={bodyClassName} role="presentation">
                {reactUserComp && !reactiveCustomComponents && (
                    <UserCompClass {...userCompDetails!.params} ref={userCompStateless ? () => {} : userCompRef} />
                )}
                {reactUserComp && reactiveCustomComponents && (
                    <CustomContext.Provider
                        value={{
                            setMethods: (methods: CustomFloatingFilterCallbacks) =>
                                floatingFilterCompProxy!.setMethods(methods),
                        }}
                    >
                        <UserCompClass {...floatingFilterProps!} />
                    </CustomContext.Provider>
                )}
            </div>
            <div
                ref={eButtonWrapper}
                aria-hidden={buttonWrapperAriaHidden}
                className={buttonWrapperClassName}
                role="presentation"
            >
                <button
                    ref={eButtonShowMainFilter}
                    type="button"
                    className="ag-button ag-floating-filter-button-button"
                    tabIndex={-1}
                ></button>
            </div>
        </div>
    );
};

export default memo(HeaderFilterCellComp);
