import makeToolboxXML from '../../../src/lib/make-toolbox-xml';

describe('makeToolboxXML', () => {
    test('adds non-color symbols to core Scratch categories', () => {
        const xml = makeToolboxXML(false, false, 'target-id');
        [
            'motion',
            'looks',
            'sound',
            'events',
            'control',
            'sensing',
            'operators',
            'variables',
            'myBlocks',
            'starter',
            'specialised'
        ].forEach(categoryId => {
            expect(xml).toMatch(new RegExp(
                `<category[\\s\\S]*?toolboxitemid="${categoryId}"[\\s\\S]*?` +
                'iconURI="data:image/svg\\+xml,%3Csvg[\\s\\S]*?>'
            ));
        });
        expect(xml).toContain('fill%3D%22%23');
        expect(xml).toContain('stroke%3D%22%23fff%22');
    });

    test('adds starter blocks as palette blocks without default workspace definitions', () => {
        const xml = makeToolboxXML(false, false, 'target-id');

        expect(xml).toContain('toolboxitemid="starter"');
        expect(xml).toContain('<block type="starter_jump">');
        expect(xml).toContain('<block type="starter_walk">');
        expect(xml).toContain('<block type="starter_drawshape">');
        expect(xml).toContain('<block type="starter_checkgameover">');
    });

    test('adds specialised audio-spatial blocks as palette blocks', () => {
        const xml = makeToolboxXML(false, false, 'target-id');

        expect(xml).toContain('toolboxitemid="specialised"');
        expect(xml).toContain('<block type="specialised_playsoundatposition">');
        expect(xml).toContain('<block type="specialised_startbeacon">');
        expect(xml).toContain('<block type="specialised_announceobjectdirection">');
        expect(xml).toContain('<block type="specialised_guideplayerto">');
    });
});
