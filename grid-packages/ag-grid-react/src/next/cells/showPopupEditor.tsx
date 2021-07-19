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
    PopupEditorWrapper,
    ICellEditorComp
} from 'ag-grid-community';
import { CssClasses } from '../utils';
import { showJsCellRenderer } from './showJsRenderer'
import { EditDetails } from './cellComp';
import { createJsComp } from '../jsComp';

export const showPopupEditor = (
    editDetails: EditDetails, 
    context: Context, 
    eGui: HTMLElement, 
    cellCtrl: CellCtrl,
    ref?: MutableRefObject<ICellEditor | undefined>
)  => {

    useEffect( ()=> {

        const cellEditor = createJsComp(context, factory => factory.createCellEditor(editDetails.compDetails) ) as ICellEditorComp;
        if (!cellEditor) { return; }
    
        const destroyFuncs: (()=>void)[] = [];
    
        const popupService = context.getBean('popupService') as PopupService;
        const gridOptionsWrapper = context.getBean('gridOptionsWrapper') as GridOptionsWrapper;
        const useModelPopup = gridOptionsWrapper.isStopEditingWhenCellsLoseFocus();
    
        const popupWrapper = new PopupEditorWrapper(editDetails.compDetails.params, cellEditor);
    
        const compGui = popupWrapper.getGui();
    
        const params = {
            column: cellCtrl.getColumn(),
            rowNode: cellCtrl.getRowNode(),
            type: 'popupCellEditor',
            eventSource: eGui,
            ePopup: compGui,
            keepWithinBounds: true
        };
    
        const positionCallback = editDetails.popupPosition === 'under' ?
            popupService.positionPopupUnderComponent.bind(popupService, params)
            : popupService.positionPopupOverComponent.bind(popupService, params);
    
        const addPopupRes = popupService.addPopup({
            modal: useModelPopup,
            eChild: compGui,
            closeOnEsc: true,
            closedCallback: () => { cellCtrl.onPopupEditorClosed(); },
            anchorToElement: eGui,
            positionCallback
        });
    
        const hideEditorPopup = addPopupRes ? addPopupRes.hideFunc : undefined;
    
        destroyFuncs.push( ()=> {
            if (hideEditorPopup) {
                hideEditorPopup();
            }
            context.destroyBean(popupWrapper);
        });
    
        if (ref) {
            ref.current = cellEditor;
            destroyFuncs.push( ()=> ref.current = undefined );
        }
    
        return () => destroyFuncs.forEach( f => f() );

    }, [context, editDetails]);


}