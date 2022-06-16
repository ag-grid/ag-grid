import { HierarchyChart } from "../../hierarchyChart";
import { Series, SeriesNodeDatum, SeriesNodeDataContext } from "../series";

export abstract class HierarchySeries<S extends SeriesNodeDatum> extends Series<SeriesNodeDataContext<S>> {
    chart?: HierarchyChart;
}