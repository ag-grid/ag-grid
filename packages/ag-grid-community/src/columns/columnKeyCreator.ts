// class returns a unique id to use for the column. it checks the existing columns, and if the requested
// id is already taken, it will start appending numbers until it gets a unique id.
// eg, if the col field is 'name', it will try ids: {name, name_1, name_2...}
// if no field or id provided in the col, it will try the ids of natural numbers
import { _toStringOrNull } from '../utils/generic';
import { _warn } from '../validation/logging';

export type IColumnKeyCreator = {
    getUniqueKey(colId?: string | null, colField?: string | null): string;
};

export class ColumnKeyCreator implements IColumnKeyCreator {
    private existingKeys: { [key: string]: boolean } = {};

    public addExistingKeys(keys: string[]): void {
        for (let i = 0; i < keys.length; i++) {
            this.existingKeys[keys[i]] = true;
        }
    }

    public getUniqueKey(colId?: string | null, colField?: string | null): string {
        // in case user passed in number for colId, convert to string
        colId = _toStringOrNull(colId);

        let count = 0;

        while (true) {
            let idToTry: string | number | null | undefined = colId ?? colField;
            if (idToTry) {
                if (count !== 0) {
                    idToTry += '_' + count;
                }
            } else {
                // no point in stringing this, object treats it the same anyway.
                idToTry = count;
            }

            if (!this.existingKeys[idToTry]) {
                const usedId = String(idToTry);
                if (colId && count > 0) {
                    _warn(273, { providedId: colId, usedId });
                }
                this.existingKeys[usedId] = true;
                return usedId;
            }

            count++;
        }
    }
}
