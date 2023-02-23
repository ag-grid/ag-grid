import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { ProxyOnWrite, ProxyPropertyOnWrite } from './proxy';

interface TestProxyObject {
    normalProp?: string;

    proxied?: string;
    target?: string;

    proxiedProp?: string;
    child: {
        proxiedProp?: string;
    };
}

describe('deprecation module', () => {
    let test: TestProxyObject;
    const originalConsoleWarn = console.warn;

    beforeEach(() => {
        class TestProxy implements TestProxyObject {
            normalProp?: string;

            @ProxyOnWrite('target')
            proxied?: string;
            target?: string;

            @ProxyPropertyOnWrite('child')
            proxiedProp?: string;
            child: { proxiedProp?: string } = {};
        }
        console.warn = jest.fn();
        test = new TestProxy();
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
    });

    describe('@ProxyOnWrite decorator', () => {
        it('should write value to named property', () => {
            test.proxied = 'test1234';
            expect(test.proxied).toEqual('test1234');
            expect(test.target).toEqual('test1234');
        });
    });

    describe('@ProxyPropertyOnWrite decorator', () => {
        it('should write value to child', () => {
            test.proxiedProp = 'test1234';
            expect(test.proxiedProp).toEqual('test1234');
            expect(test.child.proxiedProp).toEqual('test1234');
        });
    });
});
