import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { Bean } from "./context/context";
import { Qualifier } from "./context/context";

@Bean('loggerFactory')
export class LoggerFactory {

    private logging: boolean;

    private setBeans(@Qualifier('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper): void {
        this.logging = gridOptionsWrapper.isDebug();
    }

    public create(name: string) {
        return new Logger(name, this.isLogging.bind(this));
    }

    public isLogging(): boolean {
        return this.logging;
    }
}

export class Logger {

    private isLoggingFunc: () => boolean;
    private name: string;

    constructor(name: string, isLoggingFunc: () => boolean) {
        this.name = name;
        this.isLoggingFunc = isLoggingFunc;
    }

    public isLogging(): boolean {
        return this.isLoggingFunc();
    }

    public log(message: string) {
        if (this.isLoggingFunc()) {
            // tslint:disable-next-line
            console.log('ag-Grid.' + this.name + ': ' + message);
        }
    }

}
