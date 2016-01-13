/// <reference path="./abstractColumn.ts"/>

module ag.grid {

    export class OriginalColumnGroup extends AbstractColumn {

        private colGroupDef: ColGroupDef;
        private children: AbstractColumn[];

        constructor(colGroupDef: ColGroupDef) {
            super();
            this.colGroupDef = colGroupDef;
        }

        //public addChild(child: AbstractColumn): void {
        //    if (!this.children) {
        //        this.children = [];
        //    }
        //    this.children.push(child);
        //}

        public getActualWidth(): number {
            throw 'method should not be called';
        }

        public getMinimumWidth(): number {
            throw 'method should not be called';
        }

        public setChildren(children: AbstractColumn[]): void {
            this.children = children;
        }

        public getChildren(): AbstractColumn[] {
            return this.children;
        }

        public getColGroupDef(): ColGroupDef {
            return this.colGroupDef;
        }
    }

}