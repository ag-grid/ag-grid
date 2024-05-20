import HelloWorld from '@/components/HelloWorld.vue';
import { shallowMount } from '@vue/test-utils';

describe('HelloWorld.vue', () => {
    it('renders props.msg when passed', () => {
        const msg = 'new message';
        const wrapper = shallowMount(HelloWorld, {
            props: { msg },
        });
        expect(wrapper.text()).toMatch(msg);
    });
});
