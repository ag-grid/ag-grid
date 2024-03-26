import { Bean, Autowired } from '../context/context';
import { BeanStub } from '../context/beanStub';
import { ExpressionService } from './expressionService';
import { Column } from '../entities/column';
import { IRowNode } from '../interfaces/iRowNode';
import { ValueParserParams } from '../entities/colDef';
import { exists } from '../utils/generic';

@Bean('valueParserService')
export class ValueParserService extends BeanStub {
    @Autowired('expressionService') private expressionService: ExpressionService;

    public parseValue(column: Column, rowNode: IRowNode | null, newValue: any, oldValue: any): any {
        const colDef = column.getColDef();
        const params: ValueParserParams = this.gos.addGridCommonParams({
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
            return this.expressionService.evaluate(valueParser, params);
        }
        return newValue;
    }
}