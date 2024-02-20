import { GridCtrl } from 'ag-grid-community';
import { JSX } from "solid-js";
interface TabGuardProps {
    children: JSX.Element;
    eFocusableElement: HTMLDivElement;
    gridCtrl: GridCtrl;
    forceFocusOutWhenTabGuardsAreEmpty?: boolean;
    onTabKeyDown: (e: KeyboardEvent) => void;
    ref: (ref: TabGuardRef) => void;
}
export interface TabGuardRef {
    forceFocusOutOfContainer(up?: boolean): void;
}
declare const TabGuardComp: (props: TabGuardProps) => JSX.Element;
export default TabGuardComp;
