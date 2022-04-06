import { AgChartOptions, AgCartesianChartOptions, AgPolarChartOptions, AgHierarchyChartOptions } from "./agChartOptions";

interface AjvErrors {
    instancePath: string;
    keyword: 'type' | 'enum' | 'anyOf' | 'additionalProperties';
    message: string;
    params: {
        type?: string;
        allowedValues?: string[];
        additionalProperty?: string;
    };
    schemaPath: string;
}

type AjvValidationFunction<T> = {
    (input: any): input is T;
    errors?: AjvErrors[];
}

export const validateAgChartOptions: AjvValidationFunction<AgChartOptions>;
