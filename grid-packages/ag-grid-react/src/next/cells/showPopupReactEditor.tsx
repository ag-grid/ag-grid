
import React, { MutableRefObject, useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
import { createPortal } from 'react-dom';

export const showPopupReactEditor = (
    editDetails: EditDetails | undefined, 
    context: Context, 
    eGui: HTMLElement, 
    cellCtrl: CellCtrl,
    ref?: MutableRefObject<ICellEditor | undefined>
)  => {

    const showingReactPopupEditor = editDetails!=null && editDetails.popup && editDetails.compDetails.componentFromFramework;

    const popupEditorWrapper = useRef<PopupEditorWrapper>();
    const hideEditorPopup = useRef<()=>void>();

    const destroyPopup = () => {
        if (hideEditorPopup.current) {
            hideEditorPopup.current();
            hideEditorPopup.current = undefined;
        }
        popupEditorWrapper.current = context.destroyBean(popupEditorWrapper.current);
    };

    // we need to create the PopupEditorWrapper before the render hits, a we use the eGui in the React Portal
    if (showingReactPopupEditor && !popupEditorWrapper.current) {

        const compDetails = editDetails!.compDetails;
        
        const popupService = context.getBean('popupService') as PopupService;
        const gridOptionsWrapper = context.getBean('gridOptionsWrapper') as GridOptionsWrapper;
        const useModelPopup = gridOptionsWrapper.isStopEditingWhenCellsLoseFocus();
        
        popupEditorWrapper.current = new PopupEditorWrapper(compDetails.params);
        const ePopupGui = popupEditorWrapper.current.getGui();

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
    
        hideEditorPopup.current = addPopupRes ? addPopupRes.hideFunc : undefined;
    };

    if (!showingReactPopupEditor && popupEditorWrapper.current) {
        destroyPopup();
    }

    // this makes sure we destroy any remaining popup if the cell gets destroyed
    useEffect( ()=>destroyPopup, []);

    const portalChild = () => {
        const CellEditorComp = editDetails!.compDetails.componentClass;
        return <CellEditorComp {...editDetails!.compDetails.params} ref={ref}/>
    };

    return (
        <>
            {editDetails!=null && editDetails.compDetails.componentFromFramework 
                && createPortal(portalChild, popupEditorWrapper.current!.getGui()) }
        </>
    );

}
