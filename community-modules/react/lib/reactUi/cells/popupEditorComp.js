// @ag-grid-community/react v28.1.1
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const react_1 = __importStar(require("react"));
const react_dom_1 = require("react-dom");
const beansContext_1 = require("../beansContext");
const useEffectOnce_1 = require("../useEffectOnce");
const PopupEditorComp = (props) => {
    const [popupEditorWrapper, setPopupEditorWrapper] = react_1.useState();
    const { context, popupService, gridOptionsWrapper } = react_1.useContext(beansContext_1.BeansContext);
    useEffectOnce_1.useEffectOnce(() => {
        const { editDetails, cellCtrl, eParentCell } = props;
        const { compDetails } = editDetails;
        const useModelPopup = gridOptionsWrapper.isStopEditingWhenCellsLoseFocus();
        const wrapper = context.createBean(new core_1.PopupEditorWrapper(compDetails.params));
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
        setPopupEditorWrapper(wrapper);
        props.jsChildComp && props.jsChildComp.afterGuiAttached && props.jsChildComp.afterGuiAttached();
        return () => {
            if (hideEditorPopup != null) {
                hideEditorPopup();
            }
            context.destroyBean(wrapper);
        };
    });
    return (react_1.default.createElement(react_1.default.Fragment, null, popupEditorWrapper && props.wrappedContent
        && react_dom_1.createPortal(props.wrappedContent, popupEditorWrapper.getGui())));
};
exports.default = react_1.memo(PopupEditorComp);

//# sourceMappingURL=popupEditorComp.js.map
