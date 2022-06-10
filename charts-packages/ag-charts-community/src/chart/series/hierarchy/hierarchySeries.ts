import { HierarchyChart } from "../../hierarchyChart";
import { Series, SeriesNodeDatum } from "../series";

export abstract class HierarchySeries<S extends SeriesNodeDatum> extends Series<S> {
    chart?: HierarchyChart;
}