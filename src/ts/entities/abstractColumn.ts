/// <reference path="../constants.ts" />

module ag.grid {

    export abstract class ColumnGroupChild {
        public abstract getActualWidth(): number;
        public abstract getMinimumWidth(): number;
        public abstract getDefinition(): AbstractColDef;
    }
}