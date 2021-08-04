import { CellCtrl, PopupEditorWrapper } from '@ag-grid-community/core';
import React, { useEffect, useState, memo, useContext } from 'react';
import { createPortal } from 'react-dom';
import { EditDetails } from './cellComp';
import { BeansContext } from '../beansContext';

const PopupEditorComp = (props: {
            editDetails: EditDetails, 
            cellCtrl: CellCtrl, 
            eParentCell: HTMLElement,
            wrappedContent?: any,
            wrappedComp?: any,
            wrappedCompProps?: any
        }) => {

    const [popupEditorWrapper, setPopupEditorWrapper] = useState<PopupEditorWrapper>();

    const {context, popupService, gridOptionsWrapper} = useContext(BeansContext);

    useEffect( () => {
        const {editDetails, cellCtrl, eParentCell} = props;
        const {compDetails} = editDetails;

        const useModelPopup = gridOptionsWrapper.isStopEditingWhenCellsLoseFocus();
        
        const wrapper = new PopupEditorWrapper(compDetails.params);
        const ePopupGui = wrapper.getGui();

        const positionParams = {
            column: cellCtrl.getColumn(),
            rowNode: cellCtrl.getRowNode(),
            type: 'popupCellEditor',
            eventSource: eParentCell,
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
            anchorToElement: eParentCell,
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
            { popupEditorWrapper && props.wrappedContent 
                                 && createPortal(props.wrappedContent, popupEditorWrapper.getGui()) }
                                 
            { popupEditorWrapper && props.wrappedComp 
                                 && createPortal(
                            <props.wrappedComp eParentElement={popupEditorWrapper.getGui()} {...props.wrappedCompProps}/>, 
                            popupEditorWrapper.getGui()) 
            }
        </>
    );
};

export default memo(PopupEditorComp);
