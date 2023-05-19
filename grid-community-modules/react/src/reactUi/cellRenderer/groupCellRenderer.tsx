import { GroupCellRendererCtrl, GroupCellRendererParams, IGroupCellRenderer, UserCompDetails, _ } from "@ag-grid-community/core";
import React, { useContext, useImperativeHandle, forwardRef, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { BeansContext } from "../beansContext";
import { showJsComp } from "../jsComp";
import { useLayoutEffectOnce } from "../useEffectOnce";
import { CssClasses } from "../utils";

const GroupCellRenderer = forwardRef((props: GroupCellRendererParams, ref) => {

    const context = useContext(BeansContext).context!;

    const eGui = useRef<HTMLElement>(null);
    const eValueRef = useRef<HTMLElement>(null);
    const eCheckboxRef = useRef<HTMLElement>(null);
    const eExpandedRef = useRef<HTMLElement>(null);
    const eContractedRef = useRef<HTMLElement>(null);

    const [innerCompDetails, setInnerCompDetails] = useState<UserCompDetails>();
    const [childCount, setChildCount] = useState<string>();
    const [value, setValue] = useState<any>();
    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [expandedCssClasses, setExpandedCssClasses] = useState<CssClasses>(new CssClasses('ag-hidden'));
    const [contractedCssClasses, setContractedCssClasses] = useState<CssClasses>(new CssClasses('ag-hidden'));
    const [checkboxCssClasses, setCheckboxCssClasses] = useState<CssClasses>(new CssClasses('ag-invisible'));

    useImperativeHandle(ref, () => {
        return {
            // force new instance when grid tries to refresh
            refresh() { return false; }
        };
    });

    useLayoutEffect(() => {
        return showJsComp(innerCompDetails, context, eValueRef.current!);
    }, [innerCompDetails]);

    useLayoutEffectOnce(() => {

        const compProxy: IGroupCellRenderer = {
            setInnerRenderer: (details, valueToDisplay) => {
                setInnerCompDetails(details);
                setValue(valueToDisplay);
            },
            setChildCount: count => setChildCount(count),
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setContractedDisplayed: displayed => setContractedCssClasses(prev => prev.setClass('ag-hidden', !displayed)),
            setExpandedDisplayed: displayed => setExpandedCssClasses(prev => prev.setClass('ag-hidden', !displayed)),
            setCheckboxVisible: visible => setCheckboxCssClasses(prev => prev.setClass('ag-invisible', !visible))
        };

        const ctrl = context.createBean(new GroupCellRendererCtrl());
        ctrl.init(compProxy, eGui.current!, eCheckboxRef.current!, eExpandedRef.current!, eContractedRef.current!, GroupCellRenderer, props);

        return () => { context.destroyBean(ctrl);};
    });

    const className = useMemo(() => `ag-cell-wrapper ${cssClasses.toString()}`, [cssClasses]);
    const expandedClassName = useMemo(() => `ag-group-expanded ${expandedCssClasses.toString()}`, [expandedCssClasses]);
    const contractedClassName = useMemo(() => `ag-group-contracted ${contractedCssClasses.toString()}`, [contractedCssClasses]);
    const checkboxClassName = useMemo(() => `ag-group-checkbox ${checkboxCssClasses.toString()}`, [checkboxCssClasses]);

    const useFwRenderer = innerCompDetails && innerCompDetails.componentFromFramework;
    const FwRenderer = useFwRenderer ? innerCompDetails!.componentClass : undefined;
    const useValue = innerCompDetails == null && value != null;
    const escapedValue = _.escapeString(value, true);

    return (
        <span className={className} ref={eGui} {...(!props.colDef ? { role: 'gridcell' } : {})}>
            <span className={expandedClassName} ref={eExpandedRef}></span>
            <span className={contractedClassName} ref={eContractedRef}></span>
            <span className={checkboxClassName} ref={eCheckboxRef}></span>
            <span className="ag-group-value" ref={eValueRef}>
                { useValue && <>{escapedValue}</> }
                { useFwRenderer && <FwRenderer {...innerCompDetails!.params}/> }
            </span>
            <span className="ag-group-child-count">{childCount}</span>
        </span>
        );
});

// we do not memo() here, as it would stop the forwardRef working
export default GroupCellRenderer;