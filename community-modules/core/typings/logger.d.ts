import { BeanStub } from "./context/beanStub";
export declare class LoggerFactory extends BeanStub {
    private logging;
    private setBeans;
    create(name: string): Logger;
    isLogging(): boolean;
}
export declare class Logger {
    private isLoggingFunc;
    private name;
    constructor(name: string, isLoggingFunc: () => boolean);
    isLogging(): boolean;
    log(message: string): void;
}
