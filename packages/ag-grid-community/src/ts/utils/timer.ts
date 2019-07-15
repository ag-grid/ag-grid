/**
 * A Util Class only used when debugging for printing time to console
 */
export class Timer {

    private timestamp = new Date().getTime();

    public print(msg: string) {
        const duration = (new Date().getTime()) - this.timestamp;
        console.info(`${msg} = ${duration}`);
        this.timestamp = new Date().getTime();
    }
}