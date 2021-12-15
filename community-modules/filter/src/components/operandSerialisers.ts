import { _ } from '@ag-grid-community/core';
import { OperandInputElementSerialiser } from "./interfaces";

function cleanText(input: string | null): string | null {
    let text = typeof input === 'string' ? input.trim() : input;
    return _.makeNull(text);
}

export const NO_OP_SERIALISER: OperandInputElementSerialiser<string> = {
    toExpression: (o) => o,
    toInputString: (o) => o,
};

export const NUMBER_SERIALISER: OperandInputElementSerialiser<number> = {
    toExpression: (input) => {
        let text = cleanText(input);
        if (text != null && text === '-') {
            text = null;
        }
        
        return text == null ? null : parseFloat(text);
    },
    toInputString: (input) => {
        return typeof input === 'number' ? String(input) : null;
    },
};
