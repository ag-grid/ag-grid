export function deepCloneObject(object) {
    return JSON.parse(JSON.stringify(object));
}
