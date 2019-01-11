// class returns a unique id to use for the column. it checks the existing columns, and if the requested
// id is already taken, it will start appending numbers until it gets a unique id.
// eg, if the col field is 'name', it will try ids: {name, name_1, name_2...}
// if no field or id provided in the col, it will try the ids of natural numbers
import { _ } from "../utils";

export class ColumnKeyCreator {

    private existingKeys: string[] = [];

    public addExistingKeys(keys: string[]): void {
        this.existingKeys = this.existingKeys.concat(keys);
    }

    public getUniqueKey(colId: string, colField: string): string {

        // in case user passed in number for colId, convert to string
        colId = _.toStringOrNull(colId);

        let count = 0;
        while (true) {

            let idToTry: string;
            if (colId) {
                idToTry = colId;
                if (count !== 0) {
                    idToTry += '_' + count;
                }
            } else if (colField) {
                idToTry = colField;
                if (count !== 0) {
                    idToTry += '_' + count;
                }
            } else {
                idToTry = '' + count;
            }

            if (this.existingKeys.indexOf(idToTry) < 0) {
                this.existingKeys.push(idToTry);
                return idToTry;
            }

            count++;
        }
    }

}