import { MutableRefObject, useEffect, useRef, useState, useCallback } from 'react';
import {
    Context,
    CellCtrl,
    UserCompDetails,
    _,
    UserComponentFactory,
    ICellEditor,
    PopupService,
    GridOptionsWrapper,
    PopupEditorWrapper
} from 'ag-grid-community';
import { CssClasses } from '../utils';
import { showJsCellRenderer } from './showJsRenderer';
import { EditDetails } from './cellComp';

export const showInlineJsEditor = (
    editDetails: EditDetails | undefined, 
    eGui: HTMLElement, 
    cellCtrl: CellCtrl,
    ref?: MutableRefObject<ICellEditor | undefined>
)  => {

    const {context, userComponentFactory} = cellCtrl.getBeans();

    useEffect(() => {

        const showInlineJsEditor = editDetails && editDetails.compDetails 
                                    && !editDetails.compDetails.componentFromFramework
                                    && !editDetails.popup;
        if (!showInlineJsEditor) { return; }
    
        const {compDetails} = editDetails!;

        const promise = userComponentFactory.createCellEditor(compDetails!);
        if (!promise) { return; }
    
        const cellEditor = promise.resolveNow(null, x => x); // js comps are never async
        if (!cellEditor) { return; }
    
        const colDef = cellCtrl.getColumn().getColDef();
        if (cellEditor.isPopup && cellEditor.isPopup()) {
            console.warn('AG Grid: if using ReactUI of AG Grid, the correct way to put an editor in a popup is to set the property cellEditorPopup on the column definition.');
        }
        if (cellEditor.getPopupPosition && cellEditor.getPopupPosition()!=null) {
            console.warn('AG Grid: if using ReactUI of AG Grid, the correct way to position a popup editor is to set the property cellEditorPopupPosition on the column definition.');
        }

        const destroyFuncs: (()=>void)[] = [];

        const compGui = cellEditor.getGui();
        eGui.appendChild(compGui);

        destroyFuncs.push( ()=> {
            context.destroyBean(cellEditor);

            if (compGui.parentElement) {
                compGui.parentElement.removeChild(compGui);
            }
        });
    
        if (ref) {
            ref.current = cellEditor;
            destroyFuncs.push( ()=> ref.current = undefined );
        }
    
        return () => destroyFuncs.forEach( f => f() );

    }, [context, editDetails]);




}