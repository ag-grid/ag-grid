import type { AgElementFinder } from '../agElements';
import { waitFor } from './waitFor';

interface Params {
    agElementFinder: AgElementFinder;
    text: string;
    groupTitle: string;
    inputLabel: string;
    index?: number;
    speedPerCharacter?: number;
}

async function typeText({
    el,
    text,
    currentText = '',
    speedPerCharacter = 100,
}: {
    el: HTMLInputElement;
    text: string;
    currentText?: string;
    speedPerCharacter?: number;
}) {
    if (currentText === '') {
        // Delete input text
        el?.select();
        el.value = '';
    } else if (el.value === text) {
        return;
    }

    const index = currentText.length;
    el.value = el.value + text[index];
    // Trigger input event
    el.dispatchEvent(new Event('input', { bubbles: true }));

    await waitFor(speedPerCharacter);

    await typeText({
        el,
        text,
        currentText: el.value,
        speedPerCharacter,
    });
}

export async function typeInTextInput({
    agElementFinder,
    text,
    groupTitle,
    inputLabel,
    index,
    speedPerCharacter,
}: Params) {
    const textInput = agElementFinder.get('chartToolPanelTextInput', {
        groupTitle,
        inputLabel,
        index,
    });
    if (!textInput) {
        throw new Error(
            `Text input not found: ${groupTitle} > ${inputLabel}${index === undefined ? '' : ` [${index}]`}`
        );
    }

    const textInputEl = textInput.get() as HTMLInputElement;

    await typeText({ el: textInputEl, text, speedPerCharacter });

    textInputEl.blur();
}
