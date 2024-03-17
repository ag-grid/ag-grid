import { ChartController } from "../chartController";
import { ChartOptionsService } from "../services/chartOptionsService";
import { ChartMenuParamsFactory } from "./chartMenuParamsFactory";
/**
 * Contains the per-chart common beans
 */
export interface ChartMenuContext {
    chartController: ChartController;
    chartOptionsService: ChartOptionsService;
    chartMenuParamsFactory: ChartMenuParamsFactory;
    chartAxisMenuParamsFactory: ChartMenuParamsFactory;
}
