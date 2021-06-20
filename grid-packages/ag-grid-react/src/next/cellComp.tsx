import React, { useEffect, useMemo, useRef, useState } from "react";
import { Context, _, RowNode, Column, RowCtrl, ICellComp, CellCtrl, ICellRendererParams, ICellEditorParams } from "ag-grid-community";
import { CssClasses } from "./utils";

export function CellComp(props: {cellCtrl: CellCtrl, context: Context,
                                printLayout: boolean, editingRow: boolean}) {

    const { cellCtrl, context, printLayout, editingRow } = props;

    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [userStyles, setUserStyles] = useState<any>();
    const [left, setLeft] = useState<string | undefined>();
    const [width, setWidth] = useState<string | undefined>();
    const [height, setHeight] = useState<string | undefined>();
    const [transition, setTransition] = useState<string | undefined>();
    const [rendererParams, setRendererParams] = useState<ICellRendererParams>();
    const [editorParams, setEditorParams] = useState<ICellEditorParams>();

    const eGui = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // const beansToDestroy: any[] = [];

        const compProxy: ICellComp = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setUserStyles: styles => setUserStyles(styles),
            setAriaSelected: selected => false, //  setAriaSelected(eGui, selected),
            getFocusableElement: () => null as any as HTMLElement, //  this.getFocusableElement(),
            setLeft: left => setLeft(left),
            setWidth: width => setWidth(width),
            setAriaColIndex: index => false, //  setAriaColIndex(this.getGui(), index),
            setHeight: height => setHeight(height),
            setZIndex: zIndex => false, //  style.zIndex = zIndex,
            setTabIndex: tabIndex => false, //  setAttribute('tabindex', tabIndex.toString()),
            setRole: role => false, //  setAttribute('role', role),
            setColId: colId => false, //  setAttribute('col-id', colId),
            setTitle: title => false, //  setAttribute('title', title),
            setUnselectable: value => false, //  setAttribute('unselectable', value, this.eCellValue),
            setTransition: transition => setTransition(transition),
            showRenderer: (params, force) => setRendererParams(params),
            showEditor: params => setEditorParams(params),

            setIncludeSelection: include => false, // this.includeSelection = include,
            setIncludeRowDrag: include => false, // this.includeRowDrag = include,
            setIncludeDndSource: include => false, // this.includeDndSource = include,
            setForceWrapper: force => false, // this.forceWrapper = force,

            getCellEditor: () => null, // this.cellEditor ? this.cellEditor : null,
            getParentOfValue: () => eGui.current, // this.eCellValue ? this.eCellValue : null,

            // hacks
            addRowDragging: (customElement?: HTMLElement, dragStartPixels?: number) => false, // this.addRowDragging(customElement, dragStartPixels)
        };

        cellCtrl.setComp(compProxy, false, null, eGui.current!, printLayout, editingRow);

        // return () => {
        //     beansToDestroy.forEach(b => context.destroyBean(b));
        // };

    }, []);

    const className = cssClasses.toString();

    const cellStyles = {
        left,
        width,
        height,
        transition
    };

    _.assign(cellStyles, userStyles);

    const cellRendererExists = rendererParams && rendererParams.colDef && rendererParams.colDef.cellRendererFramework;

    return (
        <div ref={ eGui } className={ className } style={ cellStyles }>
            { rendererParams && !cellRendererExists && (rendererParams.valueFormatted != null ? rendererParams.valueFormatted : rendererParams.value) }
            { rendererParams && cellRendererExists && useCellRenderer(rendererParams) }
        </div>
    );
}

function useCellRenderer(params: ICellRendererParams) {
    const CellRendererClass = params.colDef!.cellRendererFramework!;
    return (
        <CellRendererClass {...params}></CellRendererClass>
    );
}