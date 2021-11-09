import { CellCtrl, ICellEditor, ICellEditorComp, UserCompDetails } from '@ag-grid-community/core';
import React, { useEffect, memo, useContext } from 'react';
import { createJsComp } from '../jsComp';
import { BeansContext } from '../beansContext';

/*
const JsEditorComp = (props: {setCellEditorRef: (cellEditor: ICellEditor | undefined)=>void, 
    compDetails: UserCompDetails, eParentElement: HTMLElement}) => {

    const {context} = useContext(BeansContext);

    useEffect(() => {

        const {compDetails, eParentElement, setCellEditorRef} = props;

        const cellEditor = createJsComp(context, factory => factory.createCellEditor(compDetails) ) as ICellEditorComp;
        if (!cellEditor) { return; }

        const compGui = cellEditor.getGui();

        if (compGui) {
            eParentElement.appendChild(cellEditor.getGui());
        }

        setCellEditorRef(cellEditor);

        cellEditor.afterGuiAttached && cellEditor.afterGuiAttached();

        return () => {
            context.destroyBean(cellEditor);
            setCellEditorRef(undefined);
            if (compGui && compGui.parentElement) {
                compGui.parentElement.removeChild(compGui);
            }
        };
    }, []);

    return (
        <></>
    );
};

export default memo(JsEditorComp);
*/