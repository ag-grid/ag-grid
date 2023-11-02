// ag-grid-react v30.2.1
import React from 'react';
import { GridCtrl } from 'ag-grid-community';
export interface TabGuardCompCallback {
    forceFocusOutOfContainer(): void;
}
interface TabGuardProps {
    children: React.ReactNode;
    eFocusableElement: HTMLDivElement;
    onTabKeyDown: (e: KeyboardEvent) => void;
    gridCtrl: GridCtrl;
}
declare const _default: React.MemoExoticComponent<React.ForwardRefExoticComponent<TabGuardProps & React.RefAttributes<TabGuardCompCallback>>>;
export default _default;
