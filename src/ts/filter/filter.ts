module awk {

    export interface Filter {

         // mandatory methods
        getGui(): any;
        isFilterActive(): boolean;
        doesFilterPass(params: any): boolean;

        // optional methods
        afterGuiAttached?(params?: {hidePopup?: Function}): void;
        onNewRowsLoaded?(): void;
    }

}