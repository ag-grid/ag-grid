var SvgFactory = require('../svgFactory');
var utils = require('../utils');
var svgFactory = new SvgFactory();

function groupCellRendererFactory(gridOptionsWrapper, selectionRendererFactory) {

    return function groupCellRenderer(params) {

        var eGroupCell = document.createElement('span');
        var node = params.node;

        var expandIconNeeded = node.group && !node.footer;
        if (expandIconNeeded) {
            var eExpandIcon = createGroupExpandIcon(node.expanded);
            eGroupCell.appendChild(eExpandIcon);
            eExpandIcon.addEventListener("click", function () {
                expandGroup(node, params);
            });
        }

        var checkboxNeeded = params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.checkbox && !node.footer;
        if (checkboxNeeded) {
            var eCheckbox = selectionRendererFactory.createSelectionCheckbox(node, params.rowIndex);
            eGroupCell.appendChild(eCheckbox);
        }

        if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.innerRenderer) {
            createFromInnerRenderer(eGroupCell, params, params.colDef.cellRenderer.innerRenderer);
        } else if (node.footer) {
            createFooterCell(eGroupCell, node);
        } else if (node.group) {
            createGroupCell(eGroupCell, node);
        } else {
            createLeafCell(eGroupCell, params);
        }

        // only do this if an indent - as this overwrites the padding that
        // the theme set, which will make things look 'not aligned' for the
        // first group level.
        if (node.footer || node.level > 0) {
            var paddingPx = node.level * 10;
            if (node.footer) {
                paddingPx += 10;
            } else if (!node.group) {
                paddingPx += 5;
            }
            eGroupCell.style.paddingLeft = paddingPx + "px";
        }

        if (node.group) {
            eGroupCell.addEventListener("dblclick", function () {
                expandGroup(node, params);
            });
        }

        return eGroupCell;
    };

    function createFromInnerRenderer(eGroupCell, params, renderer) {
        utils.useRenderer(eGroupCell, renderer, params);
    }

    function expandGroup(node, params) {
        node.expanded = !node.expanded;
        params.api.onGroupExpandedOrCollapsed();
    }

    function createGroupExpandIcon(expanded) {
        if (expanded) {
            return utils.createIcon('groupExpanded', gridOptionsWrapper, null, svgFactory.createArrowDownSvg);
        } else {
            return utils.createIcon('groupContracted', gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
        }
    }

    // creates cell with 'Total {{key}}' for a group
    function createFooterCell(eParent, node) {
        var textToDisplay = "Total " + node.key;
        var eText = document.createTextNode(textToDisplay);
        eParent.appendChild(eText);
    }

    // creates cell with '{{key}} ({{childCount}})' for a group
    function createGroupCell(eParent, node) {
        var textToDisplay = " " + node.key;
        // only include the child count if it's included, eg if user doing custom aggregation,
        // then this could be left out, or set to -1, ie no child count
        if (node.allChildrenCount >= 0) {
            textToDisplay += " (" + node.allChildrenCount + ")";
        }
        var eText = document.createTextNode(textToDisplay);
        eParent.appendChild(eText);
    }


    // creates cell with '{{key}} ({{childCount}})' for a group
    function createLeafCell(eParent, params) {
        if (params.value) {
            var eText = document.createTextNode(' ' + params.value);
            eParent.appendChild(eText);
        }
    }
}

module.exports = groupCellRendererFactory;