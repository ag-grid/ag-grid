import { BeanStub } from './context/beanStub';
import type { BeanName } from './context/context';

export class LoggerFactory extends BeanStub {
    static BeanName: BeanName = 'loggerFactory';

    public create(name: string) {
        return new Logger(name, this.isLogging.bind(this));
    }

    public isLogging(): boolean {
        if (!this.gos) {
            return false;
        }
        return this.gos.get('debug');
    }
}

export class Logger {
    private isLoggingFunc: () => boolean;
    private name: string;

    constructor(name: string, isLoggingFunc: () => boolean) {
        this.name = name;
        this.isLoggingFunc = isLoggingFunc;
    }

    public isLogging(): boolean | undefined {
        return this.isLoggingFunc();
    }

    public log(message: string) {
        if (this.isLoggingFunc()) {
            // tslint:disable-next-line
            console.log('AG Grid.' + this.name + ': ' + message);
        }
    }
}
