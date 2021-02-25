import { HierarchyChart } from "../../hierarchyChart";
import { Series } from "../series";
import { reactive } from "../../../util/observable";

export abstract class HierarchySeries extends Series {
    chart?: HierarchyChart;

    @reactive('dataChange') data: any = undefined;
}