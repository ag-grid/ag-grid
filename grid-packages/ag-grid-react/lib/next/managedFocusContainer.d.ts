// ag-grid-react v26.1.0
import React, { FC } from 'react';
import { Context, GridCtrl } from 'ag-grid-community';
export declare const ManagedFocusContainer: FC<{
    children: React.ReactNode;
    context: Context;
    eFocusableElement: HTMLDivElement;
    onTabKeyDown: (e: KeyboardEvent) => void;
    gridCtrl: GridCtrl;
}>;
