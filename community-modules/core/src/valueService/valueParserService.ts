import { BeanStub } from '../context/beanStub';
import { Bean } from '../context/context';
import { ValueParserParams } from '../entities/colDef';
import { Column } from '../entities/column';
import { IRowNode } from '../interfaces/iRowNode';
import { exists } from '../utils/generic';

@Bean('valueParserService')
export class ValueParserService extends BeanStub {

    public parseValue(column: Column, rowNode: IRowNode | null, newValue: any, oldValue: any): any {
        const colDef = column.getColDef();
        const params: ValueParserParams = this.beans.gos.addGridCommonParams({
            node: rowNode,
            data: rowNode?.data,
            oldValue,
            newValue,
            colDef,
            column
        });

        const valueParser = colDef.valueParser;

        if (exists(valueParser)) {
            if (typeof valueParser === 'function') {
                return valueParser(params);
            }
            return this.beans.expressionService.evaluate(valueParser, params);
        }
        return newValue;
    }
}