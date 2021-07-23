import { CellCtrl, ICellEditor, ICellEditorComp, UserCompDetails } from 'ag-grid-community';
import React, { useEffect } from 'react';
import { createJsComp } from '../jsComp';

const JsEditorComp = (props: {setCellEditorRef: (cellEditor: ICellEditor | undefined)=>void, 
    cellCtrl: CellCtrl, compDetails: UserCompDetails, eParentElement: HTMLElement}) => {

    useEffect(() => {

        const {cellCtrl, compDetails, eParentElement, setCellEditorRef} = props;
        const {context} = cellCtrl.getBeans();

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

export default JsEditorComp;