/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var svgFactory_1 = require('../svgFactory');
var utils_1 = require('../utils');
var constants_1 = require('../constants');
var events_1 = require('../events');
var svgFactory = svgFactory_1.SvgFactory.getInstance();
function groupCellRendererFactory(gridOptionsWrapper, selectionRendererFactory, expressionService, eventService) {
    return function groupCellRenderer(params) {
        var eGroupCell = document.createElement('span');
        var node = params.node;
        var cellExpandable = node.group && !node.footer;
        if (cellExpandable) {
            addExpandAndContract(eGroupCell, params);
        }
        var checkboxNeeded = params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.checkbox && !node.footer;
        if (checkboxNeeded) {
            var eCheckbox = selectionRendererFactory.createSelectionCheckbox(node, params.rowIndex, params.addRenderedRowListener);
            eGroupCell.appendChild(eCheckbox);
        }
        if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.innerRenderer) {
            createFromInnerRenderer(eGroupCell, params, params.colDef.cellRenderer.innerRenderer);
        }
        else if (node.footer) {
            createFooterCell(eGroupCell, params);
        }
        else if (node.group) {
            createGroupCell(eGroupCell, params);
        }
        else {
            createLeafCell(eGroupCell, params);
        }
        // only do this if an indent - as this overwrites the padding that
        // the theme set, which will make things look 'not aligned' for the
        // first group level.
        var suppressPadding = params.colDef && params.colDef.cellRenderer
            && params.colDef.cellRenderer.suppressPadding;
        if (!suppressPadding && (node.footer || node.level > 0)) {
            var paddingFactor;
            if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.padding >= 0) {
                paddingFactor = params.colDef.cellRenderer.padding;
            }
            else {
                paddingFactor = 10;
            }
            var paddingPx = node.level * paddingFactor;
            if (node.footer) {
                paddingPx += 10;
            }
            else if (!node.group) {
                paddingPx += 5;
            }
            eGroupCell.style.paddingLeft = paddingPx + 'px';
        }
        return eGroupCell;
    };
    function addExpandAndContract(eGroupCell, params) {
        var eExpandIcon = createGroupExpandIcon(true);
        var eContractIcon = createGroupExpandIcon(false);
        eGroupCell.appendChild(eExpandIcon);
        eGroupCell.appendChild(eContractIcon);
        eExpandIcon.addEventListener('click', expandOrContract);
        eContractIcon.addEventListener('click', expandOrContract);
        eGroupCell.addEventListener('dblclick', expandOrContract);
        showAndHideExpandAndContract(eExpandIcon, eContractIcon, params.node.expanded);
        // if parent cell was passed, then we can listen for when focus is on the cell,
        // and then expand / contract as the user hits enter or space-bar
        if (params.eGridCell) {
            params.eGridCell.addEventListener('keydown', function (event) {
                if (utils_1.Utils.isKeyPressed(event, constants_1.Constants.KEY_ENTER)) {
                    expandOrContract();
                    event.preventDefault();
                }
            });
        }
        function expandOrContract() {
            expandGroup(eExpandIcon, eContractIcon, params);
        }
    }
    function showAndHideExpandAndContract(eExpandIcon, eContractIcon, expanded) {
        utils_1.Utils.setVisible(eExpandIcon, !expanded);
        utils_1.Utils.setVisible(eContractIcon, expanded);
    }
    function createFromInnerRenderer(eGroupCell, params, renderer) {
        utils_1.Utils.useRenderer(eGroupCell, renderer, params);
    }
    function getRefreshFromIndex(params) {
        if (gridOptionsWrapper.isGroupIncludeFooter()) {
            return params.rowIndex;
        }
        else {
            return params.rowIndex + 1;
        }
    }
    function expandGroup(eExpandIcon, eContractIcon, params) {
        params.node.expanded = !params.node.expanded;
        var refreshIndex = getRefreshFromIndex(params);
        params.api.onGroupExpandedOrCollapsed(refreshIndex);
        showAndHideExpandAndContract(eExpandIcon, eContractIcon, params.node.expanded);
        var event = { node: params.node };
        eventService.dispatchEvent(events_1.Events.EVENT_ROW_GROUP_OPENED, event);
    }
    function createGroupExpandIcon(expanded) {
        var eIcon;
        if (expanded) {
            eIcon = utils_1.Utils.createIcon('groupContracted', gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
        }
        else {
            eIcon = utils_1.Utils.createIcon('groupExpanded', gridOptionsWrapper, null, svgFactory.createArrowDownSvg);
        }
        utils_1.Utils.addCssClass(eIcon, 'ag-group-expand');
        return eIcon;
    }
    // creates cell with 'Total {{key}}' for a group
    function createFooterCell(eGroupCell, params) {
        var footerValue;
        var groupName = getGroupName(params);
        if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.footerValueGetter) {
            var footerValueGetter = params.colDef.cellRenderer.footerValueGetter;
            // params is same as we were given, except we set the value as the item to display
            var paramsClone = utils_1.Utils.cloneObject(params);
            paramsClone.value = groupName;
            if (typeof footerValueGetter === 'function') {
                footerValue = footerValueGetter(paramsClone);
            }
            else if (typeof footerValueGetter === 'string') {
                footerValue = expressionService.evaluate(footerValueGetter, paramsClone);
            }
            else {
                console.warn('ag-Grid: footerValueGetter should be either a function or a string (expression)');
            }
        }
        else {
            footerValue = 'Total ' + groupName;
        }
        var eText = document.createTextNode(footerValue);
        eGroupCell.appendChild(eText);
    }
    function getGroupName(params) {
        var cellRenderer = params.colDef.cellRenderer;
        if (cellRenderer && cellRenderer.keyMap
            && typeof cellRenderer.keyMap === 'object' && params.colDef.cellRenderer !== null) {
            var valueFromMap = cellRenderer.keyMap[params.node.key];
            if (valueFromMap) {
                return valueFromMap;
            }
            else {
                return params.node.key;
            }
        }
        else {
            return params.node.key;
        }
    }
    // creates cell with '{{key}} ({{childCount}})' for a group
    function createGroupCell(eGroupCell, params) {
        var groupName = getGroupName(params);
        var colDefOfGroupedCol = params.api.getColumnDef(params.node.field);
        if (colDefOfGroupedCol && typeof colDefOfGroupedCol.cellRenderer === 'function') {
            params.value = groupName;
            utils_1.Utils.useRenderer(eGroupCell, colDefOfGroupedCol.cellRenderer, params);
        }
        else {
            eGroupCell.appendChild(document.createTextNode(groupName));
        }
        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        var suppressCount = params.colDef.cellRenderer && params.colDef.cellRenderer.suppressCount;
        if (!suppressCount && params.node.allChildrenCount >= 0) {
            eGroupCell.appendChild(document.createTextNode(" (" + params.node.allChildrenCount + ")"));
        }
    }
    // creates cell with '{{key}} ({{childCount}})' for a group
    function createLeafCell(eParent, params) {
        if (utils_1.Utils.exists(params.value)) {
            var eText = document.createTextNode(' ' + params.value);
            eParent.appendChild(eText);
        }
    }
}
exports.groupCellRendererFactory = groupCellRendererFactory;
