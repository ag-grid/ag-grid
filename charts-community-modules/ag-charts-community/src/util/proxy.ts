import { addTransformToInstanceProperty } from './decorator';

export function ProxyOnWrite(proxyProperty: string) {
    return addTransformToInstanceProperty((target, _, value) => {
        target[proxyProperty] = value;

        return value;
    });
}

export function ProxyPropertyOnWrite(childPropertyName: string) {
    return addTransformToInstanceProperty((target, key, value) => {
        target[childPropertyName][key] = value;

        return value;
    });
}
