/// <reference path="./originalColumnGroupChild.ts"/>

module ag.grid {

    export class OriginalColumnGroup implements OriginalColumnGroupChild {

        private colGroupDef: ColGroupDef;
        private children: OriginalColumnGroupChild[];

        constructor(colGroupDef: ColGroupDef) {
            this.colGroupDef = colGroupDef;
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