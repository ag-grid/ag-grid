import { HierarchyChart } from "../../hierarchyChart";
import { Series } from "../series";

export abstract class HierarchySeries extends Series {
    chart?: HierarchyChart;

    data: any = undefined;
}