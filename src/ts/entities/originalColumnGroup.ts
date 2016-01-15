/// <reference path="./originalColumnGroupChild.ts"/>

module ag.grid {

    export class OriginalColumnGroup implements OriginalColumnGroupChild {

        private colGroupDef: ColGroupDef;
        private children: OriginalColumnGroupChild[];
        private groupId: string;

        constructor(colGroupDef: ColGroupDef, groupId: string) {
            this.colGroupDef = colGroupDef;
            this.groupId = groupId;
        }

        public getGroupId(): string {
            return this.groupId;
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