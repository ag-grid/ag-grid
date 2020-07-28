import { ColumnController } from "./columnController";
import { Autowired, Bean } from "../context/context";
import { ColumnFactory } from "./columnFactory";
import { attrToBoolean, attrToNumber } from "../utils/generic";
import { Constants } from "../constants/constants";
import { ColDef, ColGroupDef } from "../entities/colDef";

@Bean('propertyChangeDetector')
export class PropertyChangeDetector {

    public areEqual(incomingColDefs: (ColDef | ColGroupDef)[], currentColDefs: (ColDef | ColGroupDef)[]): boolean {
        return this.areEquivalent(this.copy(currentColDefs), this.copy(incomingColDefs));
    }

    /*
     * deeper object comparison - taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     */
    public unwrapStringOrNumber(obj: any) {
        return obj instanceof Number || obj instanceof String ? obj.valueOf() : obj;
    }

    // sigh, here for ie compatibility
    private copy(value: any): any {
        if (!value) {
            return value;
        }

        if (Array.isArray(value)) {
            // shallow copy the array - this will typically be either rowData or columnDefs
            const arrayCopy = [];
            for (let i = 0; i < value.length; i++) {
                arrayCopy.push(this.copy(value[i]));
            }
            return arrayCopy;
        }

        // for anything without keys (boolean, string etc).
        // Object.keys - chrome will swallow them, IE will fail (correctly, imho)
        if (typeof value !== "object") {
            return value;
        }

        return [{}, value].reduce((r, o) => {
            Object.keys(o).forEach(function(k) {
                r[k] = o[k];
            });
            return r;
        }, {});
    }

    private isNaN(value: any) {
        if (Number.isNaN) {
            return Number.isNaN(value);
        }
        // for ie11...
        return typeof (value) === 'number' && isNaN(value);
    }
    /*
     * slightly modified, but taken from https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     *
     * What we're trying to do here is determine if the property being checked has changed in _value_, not just in reference
     *
     * For eg, if a user updates the columnDefs via property binding, but the actual columns defs are the same before and
     * after, then we don't want the grid to re-render
     */
    private areEquivalent(a: any, b: any) {
        a = this.unwrapStringOrNumber(a);
        b = this.unwrapStringOrNumber(b);
        if (a === b) return true; //e.g. a and b both null
        if (a === null || b === null || typeof a !== typeof b) return false;
        if (this.isNaN(a) && this.isNaN(b)) {
            return true;
        }
        if (a instanceof Date) {
            return b instanceof Date && a.valueOf() === b.valueOf();
        }
        if (typeof a === "function") {
            return a.toString() === b.toString();
        }
        if (typeof a !== "object") {
            return a == b; //for boolean, number, string, function, xml
        }

        const newA = a.areEquivPropertyTracking === undefined,
            newB = b.areEquivPropertyTracking === undefined;
        try {
            let prop;
            if (newA) {
                a.areEquivPropertyTracking = [];
            } else if (
                a.areEquivPropertyTracking.some(function(other: any) {
                    return other === b;
                })
            )
                return true;
            if (newB) {
                b.areEquivPropertyTracking = [];
            } else if (b.areEquivPropertyTracking.some((other: any) => other === a)) {
                return true;
            }
            a.areEquivPropertyTracking.push(b);
            b.areEquivPropertyTracking.push(a);

            const tmp = {};
            for (prop in a)
                if (prop != "areEquivPropertyTracking") {
                    (tmp as any)[prop] = null;
                }
            for (prop in b)
                if (prop != "areEquivPropertyTracking") {
                    (tmp as any)[prop] = null;
                }

            for (prop in tmp) {
                if (!this.areEquivalent(a[prop], b[prop])) {
                    return false;
                }
            }
            return true;
        } finally {
            if (newA) delete a.areEquivPropertyTracking;
            if (newB) delete b.areEquivPropertyTracking;
        }
    }
}
