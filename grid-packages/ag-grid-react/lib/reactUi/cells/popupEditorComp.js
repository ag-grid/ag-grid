// ag-grid-react v30.2.1
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var react_1 = __importStar(require("react"));
var react_dom_1 = require("react-dom");
var beansContext_1 = require("../beansContext");
var useEffectOnce_1 = require("../useEffectOnce");
var PopupEditorComp = function (props) {
    var _a = react_1.useState(), popupEditorWrapper = _a[0], setPopupEditorWrapper = _a[1];
    var _b = react_1.useContext(beansContext_1.BeansContext), context = _b.context, popupService = _b.popupService, localeService = _b.localeService, gridOptionsService = _b.gridOptionsService;
    useEffectOnce_1.useEffectOnce(function () {
        var editDetails = props.editDetails, cellCtrl = props.cellCtrl, eParentCell = props.eParentCell;
        var compDetails = editDetails.compDetails;
        var useModelPopup = gridOptionsService.is('stopEditingWhenCellsLoseFocus');
        var wrapper = context.createBean(new ag_grid_community_1.PopupEditorWrapper(compDetails.params));
        var ePopupGui = wrapper.getGui();
        if (props.jsChildComp) {
            var eChildGui = props.jsChildComp.getGui();
            if (eChildGui) {
                ePopupGui.appendChild(eChildGui);
            }
        }
        var positionParams = {
            column: cellCtrl.getColumn(),
            rowNode: cellCtrl.getRowNode(),
            type: 'popupCellEditor',
            eventSource: eParentCell,
            ePopup: ePopupGui,
            position: editDetails.popupPosition,
            keepWithinBounds: true
        };
        var positionCallback = popupService.positionPopupByComponent.bind(popupService, positionParams);
        var translate = localeService.getLocaleTextFunc();
        var addPopupRes = popupService.addPopup({
            modal: useModelPopup,
            eChild: ePopupGui,
            closeOnEsc: true,
            closedCallback: function () { cellCtrl.onPopupEditorClosed(); },
            anchorToElement: eParentCell,
            positionCallback: positionCallback,
            ariaLabel: translate('ariaLabelCellEditor', 'Cell Editor')
        });
        var hideEditorPopup = addPopupRes ? addPopupRes.hideFunc : undefined;
        setPopupEditorWrapper(wrapper);
        props.jsChildComp && props.jsChildComp.afterGuiAttached && props.jsChildComp.afterGuiAttached();
        return function () {
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
