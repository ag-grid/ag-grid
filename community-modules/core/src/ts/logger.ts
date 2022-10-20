import { Bean } from "./context/context";
import { Qualifier } from "./context/context";
import { BeanStub } from "./context/beanStub";
import { GridOptionsService } from "./gridOptionsService";

@Bean('loggerFactory')
export class LoggerFactory extends BeanStub {

    private logging: boolean;

    private setBeans(@Qualifier('gridOptionsService') gridOptionsService: GridOptionsService): void {
        this.logging = gridOptionsService.is('debug');
    }

    public create(name: string) {
        return new Logger(name, this.isLogging.bind(this));
    }

    public isLogging(): boolean {
        return this.logging;
    }
}

export class Logger {

    private isLoggingFunc: () => boolean | undefined;
    private name: string;

    constructor(name: string, isLoggingFunc: () => boolean | undefined) {
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
