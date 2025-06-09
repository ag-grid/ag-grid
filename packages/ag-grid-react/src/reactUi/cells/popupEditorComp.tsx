import { memo, useContext, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { _getActiveDomElement, _getLocaleTextFunc } from 'ag-grid-community';
import type { CellCtrl, PopupEditorWrapper } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import { useEffectOnce } from '../useEffectOnce';
import type { EditDetails } from './cellComp';

const PopupEditorComp = (props: {
    editDetails: EditDetails;
    cellCtrl: CellCtrl;
    eParentCell: HTMLElement;
    wrappedContent?: any;
    jsChildComp?: any;
}) => {
    const [popupEditorWrapper, setPopupEditorWrapper] = useState<PopupEditorWrapper>();

    const beans = useContext(BeansContext);
    const { context, popupSvc, localeSvc, gos, editSvc } = beans;
    const { editDetails, cellCtrl, eParentCell } = props;

    useEffectOnce(() => {
        const { compDetails } = editDetails;

        const useModelPopup = gos.get('stopEditingWhenCellsLoseFocus');

        const wrapper = context.createBean(editSvc!.createPopupEditorWrapper(compDetails.params));
        const ePopupGui = wrapper.getGui();

        if (props.jsChildComp) {
            const eChildGui = props.jsChildComp.getGui();
            if (eChildGui) {
                ePopupGui.appendChild(eChildGui);
            }
        }

        const { column, rowNode } = cellCtrl;
        const positionParams = {
            column,
            rowNode,
            type: 'popupCellEditor',
            eventSource: eParentCell,
            ePopup: ePopupGui,
            position: editDetails!.popupPosition,
            keepWithinBounds: true,
        };

        const positionCallback = popupSvc?.positionPopupByComponent.bind(popupSvc, positionParams);

        const translate = _getLocaleTextFunc(localeSvc);

        const addPopupRes = popupSvc?.addPopup({
            modal: useModelPopup,
            eChild: ePopupGui,
            closeOnEsc: true,
            closedCallback: () => {
                cellCtrl.onPopupEditorClosed();
            },
            anchorToElement: eParentCell,
            positionCallback,
            ariaLabel: translate('ariaLabelCellEditor', 'Cell Editor'),
        });

        const hideEditorPopup: (() => void) | undefined = addPopupRes ? addPopupRes.hideFunc : undefined;

        setPopupEditorWrapper(wrapper);

        props.jsChildComp?.afterGuiAttached?.();

        return () => {
            hideEditorPopup?.();
            context.destroyBean(wrapper);
        };
    });

    // when unmounting the component, if the popup had focus, move focus to the parent cell
    useLayoutEffect(() => {
        return () => {
            if (cellCtrl.isCellFocused() && popupEditorWrapper?.getGui().contains(_getActiveDomElement(beans as any))) {
                eParentCell.focus({ preventScroll: true });
            }
        };
    }, [popupEditorWrapper]);

    return popupEditorWrapper && props.wrappedContent
        ? createPortal(props.wrappedContent, popupEditorWrapper.getGui())
        : null;
};

export default memo(PopupEditorComp);
