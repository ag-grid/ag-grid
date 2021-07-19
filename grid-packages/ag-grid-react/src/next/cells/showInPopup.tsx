import React, { MutableRefObject, useEffect, useRef, useState, useCallback } from 'react';
import {
    Context,
    CellCtrl,
    _,
    PopupEditorWrapper,
    PopupService,
    GridOptionsWrapper,
} from 'ag-grid-community';
import { EditDetails } from './cellComp';
import { createPortal } from 'react-dom';

export const ShowInPopup = (props: {
            context: Context, 
            editDetails: EditDetails, 
            cellCtrl: CellCtrl, 
            eParentCell: HTMLElement,
            wrappedContent: any
        }) => {

    const {context, editDetails, cellCtrl, eParentCell: eGui, wrappedContent} = props;
    const {compDetails} = editDetails;

    const [popupEditorWrapper, setPopupEditorWrapper] = useState<PopupEditorWrapper>();

    useEffect( () => {
        const popupService = context.getBean('popupService') as PopupService;
        const gridOptionsWrapper = context.getBean('gridOptionsWrapper') as GridOptionsWrapper;
        const useModelPopup = gridOptionsWrapper.isStopEditingWhenCellsLoseFocus();
        
        const wrapper = new PopupEditorWrapper(compDetails.params);
        const ePopupGui = wrapper.getGui();

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
    
        const hideEditorPopup: (()=>void) | undefined = addPopupRes ? addPopupRes.hideFunc : undefined;

        setPopupEditorWrapper(wrapper);

        return ()=> {
            if (hideEditorPopup!=null) {
                hideEditorPopup();
            }
            context.destroyBean(wrapper);    
        };

    }, []);

    return (
        <>
        { popupEditorWrapper && createPortal(wrappedContent, popupEditorWrapper.getGui()) }
        </>
    );
};
