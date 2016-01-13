/// <reference path="./abstractColumn.ts"/>

module ag.grid {

    export class OriginalColumnGroup extends ColumnGroupChild {

        private colGroupDef: ColGroupDef;
        private children: ColumnGroupChild[];

        constructor(colGroupDef: ColGroupDef) {
            this.colGroupDef = colGroupDef;
        }

        public getActualWidth(): number {
            throw 'method should not be called';
        }

        public getMinimumWidth(): number {
            throw 'method should not be called';
        }

        public getDefinition(): AbstractColDef {
            throw 'method should not be called';
        }

        public setChildren(children: ColumnGroupChild[]): void {
            this.children = children;
        }

        public getChildren(): ColumnGroupChild[] {
            return this.children;
        }

        public getColGroupDef(): ColGroupDef {
            return this.colGroupDef;
        }
    }

}