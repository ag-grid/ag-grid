import type { AgChartOptions } from '../../options/agChartOptions';
import type { Chart } from '../chart';
export type TestCase = {
    options: AgChartOptions;
    enterprise: boolean;
    assertions: (chart: Chart) => Promise<void>;
    extraScreenshotActions?: (chart: Chart) => Promise<void>;
};
export declare const COMMUNITY_AND_ENTERPRISE_EXAMPLES: Record<string, TestCase>;
export declare const EXAMPLES: Record<string, TestCase>;
