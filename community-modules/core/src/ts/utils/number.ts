export function padStart(value: number, totalStringSize: number): string {
    let asString = `${value}`;

    while (asString.length < totalStringSize) {
        asString = `0${asString}`;
    }

    return asString;
}
