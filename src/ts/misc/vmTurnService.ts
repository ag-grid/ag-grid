import {Bean} from "../context/context";

@Bean('vmTurnService')
export class VMTurnService {

    private executeNextFuncs: Function[] = [];
    private waitThenExecuteFuncs: Function[] = [];

    private active = false;

    public isActive(): boolean {
        return this.active;
    }

    public setActive(active: boolean): void {
        if (this.active === active) { return; }

        this.active = active;

        if (!active) {
            this.flush();
        }
    }

    public executeNextVMTurn(func: Function): void {
        if (this.active) {
            this.executeNextFuncs.push(func);
        } else {
            func();
        }
    }

    public executeLaterVMTurn(func: Function): void {
        if (this.active) {
            this.waitThenExecuteFuncs.push(func);
        } else {
            func();
        }
    }

    public flush(): void {
        let nowFuncs = this.executeNextFuncs;
        this.executeNextFuncs = [];

        let waitFuncs = this.waitThenExecuteFuncs;
        this.waitThenExecuteFuncs = [];

        setTimeout( ()=> nowFuncs.forEach( func => func() ), 0 );
        setTimeout( ()=> waitFuncs.forEach( func => func() ), 300 );
    }
}