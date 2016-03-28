import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {Bean} from "./context/context";
import {Qualifier} from "./context/context";

@Bean('loggerFactory')
export class LoggerFactory {

    private logging: boolean;

    private setBeans(@Qualifier('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper): void {
        this.logging = gridOptionsWrapper.isDebug();
    }

    public create(name: string) {
        return new Logger(name, this.logging);
    }
}

export class Logger {

    private logging: boolean;
    private name: string;

    constructor(name: string, logging: boolean) {
        this.name = name;
        this.logging = logging;
    }

    public log(message: string) {
        if (this.logging) {
            console.log('ag-Grid.' + this.name + ': ' + message);
        }
    }

}
