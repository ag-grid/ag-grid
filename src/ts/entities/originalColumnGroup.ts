/// <reference path="./originalColumnGroupChild.ts"/>

module ag.grid {

    export class OriginalColumnGroup implements OriginalColumnGroupChild {

        private colGroupDef: ColGroupDef;
        private children: OriginalColumnGroupChild[];
        private colId: string;

        constructor(colGroupDef: ColGroupDef, colId: string) {
            this.colGroupDef = colGroupDef;
            this.colId = colId;
        }

        public getColId(): string {
            return this.colId;
        }

        public setChildren(children: OriginalColumnGroupChild[]): void {
            this.children = children;
        }

        public getChildren(): OriginalColumnGroupChild[] {
            return this.children;
        }

        public getColGroupDef(): ColGroupDef {
            return this.colGroupDef;
        }
    }

}