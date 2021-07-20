import React, { MutableRefObject, useEffect, useRef, useState, useCallback } from 'react';
import {
    Context,
    CellCtrl,
    UserCompDetails,
    _,
    UserComponentFactory,
    ICellEditor,
    PopupService,
    GridOptionsWrapper,
    PopupEditorWrapper,
    ICellEditorComp
} from 'ag-grid-community';
import { CssClasses } from '../utils';
import { showJsCellRenderer } from './showJsRenderer'
import { EditDetails } from './cellComp';
import { createJsComp } from '../jsComp';

export const JsEditorComp = (props: {setCellEditorRef: (cellEditor: ICellEditor | undefined)=>void, 
    cellCtrl: CellCtrl, compDetails: UserCompDetails, eParentElement: HTMLElement}) => {

    useEffect( ()=> {

        const {cellCtrl, compDetails, eParentElement, setCellEditorRef} = props;
        const {context} = cellCtrl.getBeans();

        const cellEditor = createJsComp(context, factory => factory.createCellEditor(compDetails) ) as ICellEditorComp;
        if (!cellEditor) { return; }

        const compGui = cellEditor.getGui();

        if (compGui) {
            eParentElement.appendChild(cellEditor.getGui());
        }

        setCellEditorRef(cellEditor);

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
