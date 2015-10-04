
module ag.grid {

    export class LoggerFactory {

        private logging: boolean;

        public init(gridOptionsWrapper: GridOptionsWrapper): void {
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

}