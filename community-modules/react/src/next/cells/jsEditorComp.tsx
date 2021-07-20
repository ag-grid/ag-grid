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
} from '@ag-grid-community/core';
import { CssClasses } from '../utils';
import { showJsCellRenderer } from './showJsRenderer'
import { EditDetails } from './cellComp';
import { createJsComp } from '../jsComp';

export const JsEditorComp = (props: {cellEditorRef: MutableRefObject<any>, 
    context: Context, compDetails: UserCompDetails, eParentElement: HTMLElement}) => {

    useEffect( ()=> {

        const {context, compDetails, eParentElement, cellEditorRef} = props;

        const cellEditor = createJsComp(context, factory => factory.createCellEditor(compDetails) ) as ICellEditorComp;
        if (!cellEditor) { return; }

        const compGui = cellEditor.getGui();

        if (compGui) {
            eParentElement.appendChild(cellEditor.getGui());
        }

        cellEditorRef.current = cellEditor;

        return () => {
            context.destroyBean(cellEditor);
            cellEditorRef.current = undefined;
            if (compGui && compGui.parentElement) {
                compGui.parentElement.removeChild(compGui);
            }
        };
    }, []);

    return (
        <></>
    );
};
