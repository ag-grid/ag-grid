// ag-grid-react v28.2.1
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
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
    var _b = react_1.useContext(beansContext_1.BeansContext), context = _b.context, popupService = _b.popupService, gridOptionsWrapper = _b.gridOptionsWrapper;
    useEffectOnce_1.useEffectOnce(function () {
        var editDetails = props.editDetails, cellCtrl = props.cellCtrl, eParentCell = props.eParentCell;
        var compDetails = editDetails.compDetails;
        var useModelPopup = gridOptionsWrapper.isStopEditingWhenCellsLoseFocus();
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
            keepWithinBounds: true
        };
        var positionCallback = editDetails.popupPosition === 'under' ?
            popupService.positionPopupUnderComponent.bind(popupService, positionParams)
            : popupService.positionPopupOverComponent.bind(popupService, positionParams);
        var translate = gridOptionsWrapper.getLocaleTextFunc();
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
