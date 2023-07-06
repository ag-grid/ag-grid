// ag-grid-react v30.0.4
import { PopupEditorWrapper } from 'ag-grid-community';
import React, { useState, memo, useContext } from 'react';
import { createPortal } from 'react-dom';
import { BeansContext } from '../beansContext.mjs';
import { useLayoutEffectOnce } from '../useEffectOnce.mjs';
const PopupEditorComp = (props) => {
    const [popupEditorWrapper, setPopupEditorWrapper] = useState();
    const { context, popupService, localeService, gridOptionsService } = useContext(BeansContext);
    useLayoutEffectOnce(() => {
        const { editDetails, cellCtrl, eParentCell } = props;
        const { compDetails } = editDetails;
        const useModelPopup = gridOptionsService.is('stopEditingWhenCellsLoseFocus');
        const wrapper = context.createBean(new PopupEditorWrapper(compDetails.params));
        const ePopupGui = wrapper.getGui();
        if (props.jsChildComp) {
            const eChildGui = props.jsChildComp.getGui();
            if (eChildGui) {
                ePopupGui.appendChild(eChildGui);
            }
        }
        const positionParams = {
            column: cellCtrl.getColumn(),
            rowNode: cellCtrl.getRowNode(),
            type: 'popupCellEditor',
            eventSource: eParentCell,
            ePopup: ePopupGui,
            position: editDetails.popupPosition,
            keepWithinBounds: true
        };
        const positionCallback = popupService.positionPopupByComponent.bind(popupService, positionParams);
        const translate = localeService.getLocaleTextFunc();
        const addPopupRes = popupService.addPopup({
            modal: useModelPopup,
            eChild: ePopupGui,
            closeOnEsc: true,
            closedCallback: () => { cellCtrl.onPopupEditorClosed(); },
            anchorToElement: eParentCell,
            positionCallback,
            ariaLabel: translate('ariaLabelCellEditor', 'Cell Editor')
        });
        const hideEditorPopup = addPopupRes ? addPopupRes.hideFunc : undefined;
        setPopupEditorWrapper(wrapper);
        props.jsChildComp && props.jsChildComp.afterGuiAttached && props.jsChildComp.afterGuiAttached();
        return () => {
            if (hideEditorPopup != null) {
                hideEditorPopup();
            }
            context.destroyBean(wrapper);
        };
    });
    return (React.createElement(React.Fragment, null, popupEditorWrapper && props.wrappedContent
        && createPortal(props.wrappedContent, popupEditorWrapper.getGui())));
};
export default memo(PopupEditorComp);
