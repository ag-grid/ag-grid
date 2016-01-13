/// <reference path="../constants.ts" />

module ag.grid {

    export abstract class AbstractColumn {
        abstractColDef: AbstractColDef;
        public abstract getActualWidth(): number;
        public abstract getMinimumWidth(): number;
    }

}