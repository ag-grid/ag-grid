import getTicks from "./ticks";
import {Color} from "./color";

test('fromHexString', () => {
    Color.fromHexString('#abc');
    Color.fromHexString('#abcdef');
    Color.fromHexString('#abcdefcc');
});
