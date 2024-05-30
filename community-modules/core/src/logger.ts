import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';

export class LoggerFactory extends BeanStub implements NamedBean {
    beanName = 'loggerFactory' as const;

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
