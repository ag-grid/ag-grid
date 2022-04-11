import { HierarchyChart } from "../../hierarchyChart";
import { Series } from "../series";
export declare abstract class HierarchySeries extends Series {
    chart?: HierarchyChart;
    data: any;
}
