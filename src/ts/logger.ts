
module awk.grid {

    export class LoggerFactory {

        private logging: boolean;

        constructor(logging: boolean) {
            this.logging = logging;
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
                console.log(this.name + " " + message);
            }
        }

    }

}