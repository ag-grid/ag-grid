import { PopupEditorWrapper } from 'ag-grid-community';
import { onCleanup, useContext } from 'solid-js';
import { Portal } from "solid-js/web";
import { BeansContext } from '../core/beansContext';
const PopupEditorComp = (props) => {
    const { context, popupService, gridOptionsWrapper } = useContext(BeansContext);
    const { editDetails, cellCtrl, eParentCell } = props;
    const { compDetails } = editDetails;
    const useModelPopup = gridOptionsWrapper.isStopEditingWhenCellsLoseFocus();
    const wrapper = context.createBean(new PopupEditorWrapper(compDetails.params));
    const ePopupGui = wrapper.getGui();
    const positionParams = {
        column: cellCtrl.getColumn(),
        rowNode: cellCtrl.getRowNode(),
        type: 'popupCellEditor',
        eventSource: eParentCell,
        ePopup: ePopupGui,
        keepWithinBounds: true
    };
    const positionCallback = editDetails.popupPosition === 'under' ?
        popupService.positionPopupUnderComponent.bind(popupService, positionParams)
        : popupService.positionPopupOverComponent.bind(popupService, positionParams);
    const translate = gridOptionsWrapper.getLocaleTextFunc();
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
    onCleanup(() => {
        if (hideEditorPopup != null) {
            hideEditorPopup();
        }
        context.destroyBean(wrapper);
    });
    return (<Portal mount={ePopupGui}>
            {props.children}
        </Portal>);
};
export default PopupEditorComp;
