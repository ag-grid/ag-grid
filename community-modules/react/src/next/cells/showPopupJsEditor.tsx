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
} from '@ag-grid-community/core';
import { CssClasses } from '../utils';
import { showJsCellRenderer } from './showJsRenderer'
import { EditDetails } from './cellComp';
import { createJsComp } from '../jsComp';

export const showPopupJsEditor = (
    editDetails: EditDetails | undefined, 
    context: Context, 
    eGui: HTMLElement, 
    cellCtrl: CellCtrl,
    ref?: MutableRefObject<ICellEditor | undefined>
)  => {

    useEffect( ()=> {

        const doNothing = editDetails==null || !editDetails.popup || editDetails.compDetails.componentFromFramework;
        if (doNothing) { return; }

        const compDetails = editDetails!.compDetails;
        
        const destroyFuncs: (()=>void)[] = [];
        
        const popupService = context.getBean('popupService') as PopupService;
        const gridOptionsWrapper = context.getBean('gridOptionsWrapper') as GridOptionsWrapper;
        const useModelPopup = gridOptionsWrapper.isStopEditingWhenCellsLoseFocus();
        
        const popupWrapper = new PopupEditorWrapper(compDetails.params);
        const ePopupGui = popupWrapper.getGui();

        const cellEditor = createJsComp(context, factory => factory.createCellEditor(compDetails) ) as ICellEditorComp;
        if (cellEditor) {
            ePopupGui.appendChild(cellEditor.getGui());
            destroyFuncs.push( ()=> {
                context.destroyBean(cellEditor);
            });
        }

        const positionParams = {
            column: cellCtrl.getColumn(),
            rowNode: cellCtrl.getRowNode(),
            type: 'popupCellEditor',
            eventSource: eGui,
            ePopup: ePopupGui,
            keepWithinBounds: true
        };
    
        const positionCallback = editDetails!.popupPosition === 'under' ?
            popupService.positionPopupUnderComponent.bind(popupService, positionParams)
            : popupService.positionPopupOverComponent.bind(popupService, positionParams);
    
        const addPopupRes = popupService.addPopup({
            modal: useModelPopup,
            eChild: ePopupGui,
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
