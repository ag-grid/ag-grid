import { describe, expect, it } from '@jest/globals';
import { addNonBreakingSpaceBetweenLastWords } from './add-non-breaking-space-between-last-words';

const nbsp = '\u00A0';

describe.each([
  { text: 'some text here.', output: `some text${nbsp}here.` },
  { text: 'some space after .', output: `some space after${nbsp}.` },
  { text: 'no-break.', output: `no-break.` },
])('addNonBreakingSpaceBetweenLastWords', ({
  text,
  output
}) => {
  it(`outputs ${output}`, () => {
    expect(addNonBreakingSpaceBetweenLastWords(text)).toEqual(output);
  });
});