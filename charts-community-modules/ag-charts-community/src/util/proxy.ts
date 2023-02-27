import { addTransformToInstanceProperty } from './decorator';

export function ProxyOnWrite(proxyProperty: string) {
    return addTransformToInstanceProperty((target, _, value) => {
        target[proxyProperty] = value;

        return value;
    });
}

export function ProxyPropertyOnWrite(childName: string, childProperty?: string) {
    return addTransformToInstanceProperty((target, key, value) => {
        target[childName][childProperty ?? key] = value;

        return value;
    });
}
