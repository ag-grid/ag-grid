import {Group} from "../../scene/group";
import {Chart} from "../chart";

export abstract class Series {
    abstract set data(data: any[]);
    abstract get data(): any[];

    protected _chart: Chart | null = null;
    abstract set chart(chart: Chart | null);
    abstract get chart(): Chart | null;

    readonly group: Group = new Group();
    abstract processData(): void;
    abstract update(): void;
}
