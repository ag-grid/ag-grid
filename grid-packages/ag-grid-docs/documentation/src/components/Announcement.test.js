import React from 'react';
import renderer from 'react-test-renderer';
import { Announcement } from './Announcement';

describe('Announcement', () => {
    it('renders with title', () => {
        const tree = renderer
            .create(<Announcement title="My Title">My content</Announcement>)
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
});