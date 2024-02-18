import { GridCtrl } from 'ag-grid-community';
import { JSX } from "solid-js";
interface TabGuardProps {
    children: JSX.Element;
    eFocusableElement: HTMLDivElement;
    onTabKeyDown: (e: KeyboardEvent) => void;
    gridCtrl: GridCtrl;
    ref: (ref: TabGuardRef) => void;
}
export interface TabGuardRef {
    forceFocusOutOfContainer(up?: boolean): void;
}
declare const TabGuardComp: (props: TabGuardProps) => JSX.Element;
export default TabGuardComp;
