//Interface provided to break circular dependency between context and Logger.
// Context will take an ILogger instead of a logger.
export interface ILogger {
    log(message: string):void;
}