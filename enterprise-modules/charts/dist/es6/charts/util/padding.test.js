import { Padding } from "./padding";
test('constructor', function () {
    {
        var padding = new Padding();
        expect(padding.top).toBe(0);
        expect(padding.right).toBe(0);
        expect(padding.bottom).toBe(0);
        expect(padding.left).toBe(0);
    }
    {
        var padding = new Padding(10);
        expect(padding.top).toBe(10);
        expect(padding.right).toBe(10);
        expect(padding.bottom).toBe(10);
        expect(padding.left).toBe(10);
    }
    {
        var padding = new Padding(10, 20);
        expect(padding.top).toBe(10);
        expect(padding.right).toBe(20);
        expect(padding.bottom).toBe(10);
        expect(padding.left).toBe(20);
    }
    {
        var padding = new Padding(10, 20, 30);
        expect(padding.top).toBe(10);
        expect(padding.right).toBe(20);
        expect(padding.bottom).toBe(30);
        expect(padding.left).toBe(20);
    }
    {
        var padding = new Padding(10, 20, 30, 40);
        expect(padding.top).toBe(10);
        expect(padding.right).toBe(20);
        expect(padding.bottom).toBe(30);
        expect(padding.left).toBe(40);
    }
});
