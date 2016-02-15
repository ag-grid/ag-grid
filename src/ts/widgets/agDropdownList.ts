import _ from '../utils';
import SvgFactory from "../svgFactory";
import PopupService from "./agPopupService";
import DragAndDropService from "../dragAndDrop/dragAndDropService";
import AgList from "./agList";

var svgFactory = SvgFactory.getInstance();

export default class AgDropdownList {

    private itemSelectedListeners: any;
    private eValue: any;
    private agList: any;
    private eGui: any;
    private hidePopupCallback: any;
    private selectedItem: any;
    private cellRenderer: any;
    private popupService: PopupService;

    constructor(popupService: PopupService, dragAndDropService: DragAndDropService) {
        this.popupService = popupService;
        this.setupComponents(dragAndDropService);
        this.itemSelectedListeners = [];
    }

    setWidth(width: any) {
        this.eValue.style.width = width + 'px';
        this.agList.addStyles({width: width + 'px'});
    }

    addItemSelectedListener(listener: any) {
        this.itemSelectedListeners.push(listener);
    }

    fireItemSelected(item: any) {
        for (var i = 0; i < this.itemSelectedListeners.length; i++) {
            this.itemSelectedListeners[i](item);
        }
    }

    setupComponents(dragAndDropService: DragAndDropService) {
        this.eGui = document.createElement('span');
        this.eValue = document.createElement('span');
        this.eGui.appendChild(this.eValue);
        this.agList = new AgList(dragAndDropService);

        this.eValue.addEventListener('click', this.onClick.bind(this));
        this.agList.addItemSelectedListener(this.itemSelected.bind(this));
        this.agList.addCssClass('ag-popup-list');

        _.addStylesToElement(this.eValue, {
            border: '1px solid darkgrey',
            display: 'inline-block',
            paddingLeft: 2
        });
        _.addStylesToElement(this.eGui, {position: 'relative'});

        this.agList.addStyles({
            display: 'inline-block',
            position: 'absolute',
            top: 0,
            left: 0,
            backgroudColor: 'white'
        });
    }

    itemSelected(item: any) {
        this.setSelected(item);
        if (this.hidePopupCallback) {
            this.hidePopupCallback();
        }
        this.fireItemSelected(item);
    }

    onClick() {
        var agListGui = this.agList.getGui();
        this.popupService.positionPopup(this.eGui, agListGui, false);
        this.hidePopupCallback = this.popupService.addAsModalPopup(agListGui, true);
    }

    getGui() {
        return this.eGui;
    }

    setSelected(item: any) {
        this.selectedItem = item;
        this.refreshView();
    }

    setCellRenderer(cellRenderer: any) {
        this.agList.setCellRenderer(cellRenderer);
        this.cellRenderer = cellRenderer;
    }

    refreshView() {
        _.removeAllChildren(this.eValue);

        if (this.selectedItem) {
            if (this.cellRenderer) {
                var params = {value: this.selectedItem};
                _.useRenderer(this.eValue, this.cellRenderer, params);
            } else {
                this.eValue.appendChild(document.createTextNode(this.selectedItem));
            }
        }

        var eDownIcon: any = svgFactory.createSmallArrowDownSvg();
        eDownIcon.style.float = 'right';
        eDownIcon.style.marginTop = '6';
        eDownIcon.style.marginRight = '2';

        this.eValue.appendChild(eDownIcon);
    }

    setModel(model: any) {
        this.agList.setModel(model);
    }
}
