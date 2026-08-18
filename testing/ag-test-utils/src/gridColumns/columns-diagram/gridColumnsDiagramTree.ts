import type { Column, ColumnGroup } from 'ag-grid-community';

import type { GridColumns } from '../gridColumns';
import { columnDiagram, columnGroupDiagram } from './formatting';

type ColumnTreeItem = Column | ColumnGroup;

interface DiagramNode {
    /** The formatted text for this node (without tree prefix). */
    text: string;
    /** Child nodes in the diagram tree. */
    children: DiagramNode[];
    /** Whether this is a hidden column (child of collapsed group). */
    isHidden: boolean;
}

/**
 * Builds the complete ASCII-tree diagram string for the column structure.
 */
export function buildColumnsDiagram(gridColumns: GridColumns, printErrors: boolean): string {
    const { api, options } = gridColumns;
    const showPaddingGroups = options.showPaddingGroups ?? false;
    const printHiddenColumns = options.printHiddenColumns ?? true;
    const filterSections = options.sections ? new Set(options.sections) : null;

    let result = '';

    // Build each section
    const sections: { label: string; tree: ColumnTreeItem[] }[] = [
        { label: 'LEFT', tree: gridColumns.leftTree },
        { label: 'CENTER', tree: gridColumns.centerTree },
        { label: 'RIGHT', tree: gridColumns.rightTree },
    ];

    for (const section of sections) {
        if (filterSections && !filterSections.has(section.label.toLowerCase() as 'left' | 'center' | 'right')) {
            continue;
        }
        if (section.tree.length === 0) {
            continue;
        }

        const diagramNodes = buildDiagramNodes(section.tree, api, showPaddingGroups, printHiddenColumns);
        if (diagramNodes.length === 0) {
            continue;
        }

        result += section.label + '\n';
        result += renderTree(diagramNodes, '');
    }

    // Trailing errors
    if (printErrors) {
        const errorsStr = gridColumns.errors.toString();
        if (errorsStr.length > 0) {
            result += '\n' + errorsStr;
        }
        if (gridColumns.errors.totalErrorsCount > 0) {
            result += '\n❌ GRID COLUMNS HAS ' + gridColumns.errors.totalErrorsCount + ' ERRORS\n';
        }
    }

    return result;
}

function buildDiagramNodes(
    tree: ColumnTreeItem[],
    api: any,
    showPaddingGroups: boolean,
    printHiddenColumns: boolean
): DiagramNode[] {
    const result: DiagramNode[] = [];

    for (const item of tree) {
        if (item.isColumn) {
            // Leaf column
            result.push({
                text: columnDiagram(item, api, false),
                children: [],
                isHidden: false,
            });
        } else {
            // Column group
            const group = item as ColumnGroup;

            // For padding groups: skip the group node and hoist children (unless showPaddingGroups is true)
            if (group.isPadding() && !showPaddingGroups) {
                result.push(...buildGroupChildNodes(group, api, showPaddingGroups, printHiddenColumns));
                continue;
            }

            const groupNode: DiagramNode = {
                text: columnGroupDiagram(group, api),
                children: buildGroupChildNodes(group, api, showPaddingGroups, printHiddenColumns),
                isHidden: false,
            };

            result.push(groupNode);
        }
    }

    return result;
}

/**
 * Builds child diagram nodes for a group, interleaving displayed and hidden children
 * in their original order from getChildren(). Hidden columns appear in their natural
 * position with a `hidden` flag, just like GridRows shows hidden rows in position.
 */
function buildGroupChildNodes(
    group: ColumnGroup,
    api: any,
    showPaddingGroups: boolean,
    printHiddenColumns: boolean
): DiagramNode[] {
    const allChildren = group.getChildren() ?? [];
    const displayedChildren = group.getDisplayedChildren() ?? [];
    const displayedSet = new Set<ColumnTreeItem>(displayedChildren);
    const result: DiagramNode[] = [];

    for (const child of allChildren) {
        const isHidden = !displayedSet.has(child);

        if (isHidden && !printHiddenColumns) {
            continue; // Skip hidden children when not printing them
        }

        if (child.isColumn) {
            result.push({
                text: columnDiagram(child, api, isHidden),
                children: [],
                isHidden,
            });
        } else {
            const childGroup = child as ColumnGroup;

            if (isHidden && childGroup.isPadding() && !showPaddingGroups) {
                // Hidden padding group — hoist its children as hidden (same as displayed padding groups)
                result.push(...buildHiddenGroupChildren(childGroup, api, showPaddingGroups));
            } else if (isHidden) {
                // Hidden non-padding group — show the group with hidden flag
                const groupNode: DiagramNode = {
                    text: columnGroupDiagram(childGroup, api) + ' hidden',
                    children: buildHiddenGroupChildren(childGroup, api, showPaddingGroups),
                    isHidden: true,
                };
                result.push(groupNode);
            } else if (childGroup.isPadding() && !showPaddingGroups) {
                // Padding group — hoist its children
                result.push(...buildGroupChildNodes(childGroup, api, showPaddingGroups, printHiddenColumns));
            } else {
                // Normal displayed group
                const groupNode: DiagramNode = {
                    text: columnGroupDiagram(childGroup, api),
                    children: buildGroupChildNodes(childGroup, api, showPaddingGroups, printHiddenColumns),
                    isHidden: false,
                };
                result.push(groupNode);
            }
        }
    }

    return result;
}

/** Recursively builds all children of a hidden group, marking everything as hidden. */
function buildHiddenGroupChildren(group: ColumnGroup, api: any, showPaddingGroups: boolean = false): DiagramNode[] {
    const children = group.getChildren() ?? [];
    const result: DiagramNode[] = [];

    for (const child of children) {
        if (child.isColumn) {
            result.push({
                text: columnDiagram(child, api, true),
                children: [],
                isHidden: true,
            });
        } else {
            const childGroup = child as ColumnGroup;
            // Hoist hidden padding groups just like displayed ones
            if (childGroup.isPadding() && !showPaddingGroups) {
                result.push(...buildHiddenGroupChildren(childGroup, api, showPaddingGroups));
                continue;
            }
            result.push({
                text: columnGroupDiagram(childGroup, api) + ' hidden',
                children: buildHiddenGroupChildren(childGroup, api, showPaddingGroups),
                isHidden: true,
            });
        }
    }

    return result;
}

/**
 * Renders a list of DiagramNodes as an ASCII tree with the same prefix style as GridRows.
 */
function renderTree(nodes: DiagramNode[], indent: string): string {
    let result = '';

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const isLast = i === nodes.length - 1;
        const hasChildren = node.children.length > 0;

        // Build the branch connector
        const connector = isLast ? '└─' : '├─';
        const childConnector = hasChildren ? '┬ ' : '─ ';
        const prefix = indent + connector + childConnector;

        result += prefix + node.text + '\n';

        if (hasChildren) {
            const nextIndent = indent + (isLast ? '  ' : '│ ');
            result += renderTree(node.children, nextIndent);
        }
    }

    return result;
}
