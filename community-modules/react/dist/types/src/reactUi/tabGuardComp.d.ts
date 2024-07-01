import type { GridCtrl } from '@ag-grid-community/core';
import React from 'react';
export interface TabGuardCompCallback {
    forceFocusOutOfContainer(up?: boolean): void;
}
interface TabGuardProps {
    children: React.ReactNode;
    eFocusableElement: HTMLDivElement;
    forceFocusOutWhenTabGuardsAreEmpty?: boolean;
    gridCtrl: GridCtrl;
    onTabKeyDown: (e: KeyboardEvent) => void;
}
declare const _default: React.MemoExoticComponent<React.ForwardRefExoticComponent<TabGuardProps & React.RefAttributes<TabGuardCompCallback>>>;
export default _default;
