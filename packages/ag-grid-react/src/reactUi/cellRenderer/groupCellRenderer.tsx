import React, {
    forwardRef,
    useCallback,
    useContext,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

import type {
    GroupCellRendererParams,
    IGroupCellRenderer,
    IGroupCellRendererCtrl,
    UserCompDetails,
} from 'ag-grid-community';
import { CssClassManager, _toString } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import { showJsComp } from '../jsComp';

type CssManagers = {
    wrapper: CssClassManager;
    expanded: CssClassManager;
    contracted: CssClassManager;
    checkbox: CssClassManager;
};

const GroupCellRenderer = forwardRef((props: GroupCellRendererParams, ref) => {
    const { registry, context } = useContext(BeansContext);

    const eGui = useRef<HTMLElement | null>(null);
    const eValueRef = useRef<HTMLElement>(null);
    const eCheckboxRef = useRef<HTMLElement>(null);
    const eExpandedRef = useRef<HTMLElement>(null);
    const eContractedRef = useRef<HTMLElement>(null);
    const ctrlRef = useRef<IGroupCellRendererCtrl>();
    const cssManagersRef = useRef<CssManagers>();

    const [innerCompDetails, setInnerCompDetails] = useState<UserCompDetails>();
    const [childCount, setChildCount] = useState<string>();
    const [value, setValue] = useState<any>();

    useImperativeHandle(ref, () => {
        return {
            // refresh in place when the controller can handle it (same node);
            // otherwise return false so cellComp creates a new instance.
            refresh(params: GroupCellRendererParams) {
                return ctrlRef.current?.refresh(params) ?? false;
            },
        };
    });

    useLayoutEffect(() => {
        return showJsComp(innerCompDetails, context, eValueRef.current!);
    }, [innerCompDetails]);

    const setRef = useCallback((eRef: HTMLDivElement | null) => {
        eGui.current = eRef;
        if (!eRef || context.isDestroyed()) {
            ctrlRef.current = context.destroyBean(ctrlRef.current);
            return;
        }

        // Lazy-create managers and seed their base classes so React never owns
        // these elements' classNames — preventing reconciliation from clobbering
        // manager updates.
        if (!cssManagersRef.current) {
            const make = (getEl: () => HTMLElement | null, baseClasses: string) => {
                const manager = new CssClassManager(getEl);
                manager.toggleCss(baseClasses, true);
                return manager;
            };
            cssManagersRef.current = {
                wrapper: make(() => eGui.current, 'ag-cell-wrapper'),
                expanded: make(() => eExpandedRef.current, 'ag-group-expanded ag-hidden'),
                contracted: make(() => eContractedRef.current, 'ag-group-contracted ag-hidden'),
                checkbox: make(() => eCheckboxRef.current, 'ag-group-checkbox ag-invisible'),
            };
        }
        const cssManagers = cssManagersRef.current;

        const compProxy: IGroupCellRenderer = {
            setInnerRenderer: (details, valueToDisplay) => {
                setInnerCompDetails(details);
                setValue(valueToDisplay);
            },
            setChildCount: (count) => setChildCount(count),
            toggleCss: (name, on) => cssManagers.wrapper.toggleCss(name, on),
            setContractedDisplayed: (displayed) => cssManagers.contracted.toggleCss('ag-hidden', !displayed),
            setExpandedDisplayed: (displayed) => cssManagers.expanded.toggleCss('ag-hidden', !displayed),
            setCheckboxVisible: (visible) => cssManagers.checkbox.toggleCss('ag-invisible', !visible),
            setCheckboxSpacing: (add) => cssManagers.checkbox.toggleCss('ag-group-checkbox-spacing', add),
        };

        const groupCellRendererCtrl = registry.createDynamicBean<IGroupCellRendererCtrl>('groupCellRendererCtrl', true);
        if (groupCellRendererCtrl) {
            ctrlRef.current = context.createBean(groupCellRendererCtrl);
            ctrlRef.current.init(
                compProxy,
                eRef,
                eCheckboxRef.current!,
                eExpandedRef.current!,
                eContractedRef.current!,
                GroupCellRenderer,
                props
            );
        }
    }, []);

    const useFwRenderer = innerCompDetails?.componentFromFramework;
    const FwRenderer = useFwRenderer ? innerCompDetails!.componentClass : undefined;
    const useValue = innerCompDetails == null && value != null;
    const escapedValue = _toString(value);

    // if there is no ColDef, it means this is a Full Width Group, then we need to add `role="gridcell"`.
    return (
        <span ref={setRef} {...(!props.colDef ? { role: ctrlRef.current?.getCellAriaRole() } : {})}>
            <span ref={eExpandedRef}></span>
            <span ref={eContractedRef}></span>
            <span ref={eCheckboxRef}></span>
            <span className="ag-group-value" ref={eValueRef}>
                {useValue ? escapedValue : useFwRenderer ? <FwRenderer {...innerCompDetails!.params} /> : null}
            </span>
            <span className="ag-group-child-count">{childCount}</span>
        </span>
    );
});

// we do not memo() here, as it would stop the forwardRef working
export default GroupCellRenderer;
