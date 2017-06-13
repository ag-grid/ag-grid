export class GroupValueService {
    public static getGroupName(keyMap:{[id:string]:string}, rowNodeKey:string): string {
        if (keyMap && typeof keyMap === 'object') {
            let valueFromMap = keyMap[rowNodeKey];
            if (valueFromMap) {
                return valueFromMap;
            } else {
                return rowNodeKey;
            }
        } else {
            return rowNodeKey;
        }
    }
}