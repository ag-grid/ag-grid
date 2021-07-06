export function classesList(...list: (string | null | undefined)[]): string {
    const filtered = list.filter( s => s != null && s != '');
    return filtered.join(' ');
}

export class CssClasses {

    private classesMap: {[name: string]: boolean} = {};

    constructor() {

    }

    public setClass(className: string, on: boolean): CssClasses {
        const res = new CssClasses();
        res.classesMap = {...this.classesMap};
        res.classesMap[className] = on;
        return res;
    }

    public toString(): string {
        const res = Object.keys(this.classesMap).filter( key => this.classesMap[key] ).join(' ');
        return res;
    }
}