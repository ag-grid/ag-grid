import { GetContextMenuItems } from '@ag-grid-community/core';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { Feature } from '.';

export const contextMenuFeature: Feature = {
  name: 'contextMenu',
  displayName: 'Context Menu',
  commonVariablePrefix: '--ag-menu-',
  variableNames: [
    '--ag-foreground-color',
    '--ag-secondary-foreground-color',
    '--ag-menu-min-width',
    '--ag-widget-container-vertical-padding',
    '--ag-widget-container-horizontal-padding',
  ],
  gridOptions: {
    getContextMenuItems,
  },
  defaultColDef: {},
  show() {
    const gridRect = document.querySelectorAll('.ag-root-wrapper')[0].getBoundingClientRect();
    const event = new MouseEvent('contextmenu', {
      button: 2,
      bubbles: true,
      clientX: gridRect.x + 50,
      clientY: gridRect.y + 100,
    });
    document.querySelectorAll('.ag-cell-value')[0].dispatchEvent(event);
  },
  modules: [MenuModule, ClipboardModule],
};

function getContextMenuItems(): ReturnType<GetContextMenuItems> {
  return [
    {
      name: 'Text item',
    },
    {
      name: 'Disabled item',
      disabled: true,
    },
    {
      name: 'Item with tooltip',
      tooltip: "Here's some extra information",
    },
    {
      name: 'Submenu',
      subMenu: [
        { name: 'Option 1' },
        { name: 'Option 2' },
        { name: 'Option 3' },
        { name: 'Option 4' },
        { name: 'Option 5' },
      ],
    },
    'separator',
    {
      name: 'Custom icon',
      shortcut: 'Alt + W',
      icon: '<img src="https://www.ag-grid.com/example-assets/skills/windows.png" />',
    },
    {
      name: 'Built-in check mark',
      checked: true,
    },
    'separator',
    'copy',
    'paste',
  ];
}
