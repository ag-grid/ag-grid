import { CartesianChart } from './cartesianChart';

export class GroupedCategoryChart extends CartesianChart {
    static className = 'GroupedCategoryChart';
    static type = 'groupedCategory' as const;
}
