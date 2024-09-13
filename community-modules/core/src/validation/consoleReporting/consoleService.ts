import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import { _warnOnce } from '../../utils/function';
import type { ValidationService } from '../validationService';
import type { ConsoleID } from './consoleMappings';

const detail = 'Include ValidationModule to see the full message.';

/**
 * Console service for logging warnings and errors
 * It will always be present to be able to log short messages to the console
 * while the big text content will be contained in the validations module.
 */
export class ConsoleService extends BeanStub implements NamedBean {
    beanName = 'consoleService' as const;
    private validationService?: ValidationService;

    public wireBeans(beans: BeanCollection): void {
        this.validationService = beans.validationService;
    }

    public warnOnce(id: ConsoleID, ...args: any[]): void {
        if (this.validationService) {
            this.validationService.warnOnce(id, ...args);
        } else {
            _warnOnce('Warning Id: ' + id + ' ' + detail);
        }
    }
}
