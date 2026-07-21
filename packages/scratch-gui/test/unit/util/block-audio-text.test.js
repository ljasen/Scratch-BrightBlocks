import {
    formatMessage,
    getBlockAudioText,
    getCatalogExplanation,
    getRenderedBlockText,
    getBlockType,
    normalizeLocale
} from '../../../src/lib/block-audio/text';
import messages from '../../../src/lib/block-audio/messages';

describe('block audio text', () => {
    test('returns the block type from Scratch Blocks block objects', () => {
        expect(getBlockType({type: 'motion_movesteps'})).toBe('motion_movesteps');
    });

    test('returns the block opcode from VM block objects', () => {
        expect(getBlockType({opcode: 'motion_movesteps'})).toBe('motion_movesteps');
    });

    test('returns English default text', () => {
        expect(getBlockAudioText({type: 'motion_movesteps'}, 'name', 'en', {})).toBe('move steps');
    });

    test('returns rendered block text for spoken names', () => {
        const block = {
            type: 'motion_movesteps',
            toString: () => 'move 10 steps'
        };

        expect(getRenderedBlockText(block)).toBe('move 10 steps');
        expect(getBlockAudioText(block, 'name', 'en', {})).toBe('move 10 steps');
    });

    test('returns rendered text for unmapped blocks', () => {
        const block = {
            type: 'motion_goto',
            toString: () => 'go to random position'
        };

        expect(getBlockAudioText(block, 'name', 'en', {})).toBe('go to random position');
    });

    test('speaks x and y axis change blocks in child-friendly language', () => {
        expect(getBlockAudioText({
            type: 'motion_changexby',
            toString: () => 'change x by 10'
        }, 'name', 'en', {})).toBe('move the sprite right by 10');
        expect(getBlockAudioText({
            type: 'motion_changexby',
            toString: () => 'change x by -10'
        }, 'name', 'en', {})).toBe('move the sprite left by 10');
        expect(getBlockAudioText({
            type: 'motion_changeyby',
            toString: () => 'change y by 10'
        }, 'name', 'en', {})).toBe('move the sprite up by 10');
        expect(getBlockAudioText({
            type: 'motion_changeyby',
            toString: () => 'change y by -10'
        }, 'name', 'en', {})).toBe('move the sprite down by 10');
    });

    test('speaks x and y axis set blocks in child-friendly language', () => {
        expect(getBlockAudioText({
            type: 'motion_setx',
            toString: () => 'set x to 25'
        }, 'name', 'en', {})).toBe('put the sprite at x 25, right of center');
        expect(getBlockAudioText({
            type: 'motion_sety',
            toString: () => 'set y to -25'
        }, 'name', 'en', {})).toBe('put the sprite at y -25, below center');
    });

    test('speaks combined x and y position blocks in child-friendly language', () => {
        expect(getBlockAudioText({
            type: 'motion_gotoxy',
            toString: () => 'go to x: 10 y: -20'
        }, 'name', 'en', {})).toBe('go to a position x 10, right of center and y -20, below center');
        expect(getBlockAudioText({
            type: 'motion_glidesecstoxy',
            toString: () => 'glide 1 secs to x: 0 y: 20'
        }, 'name', 'en', {})).toBe(
            'glide for 1 second to a position x 0, on the center line and y 20, above center'
        );
    });

    test('adds loop wording to rendered forever and repeat block names', () => {
        expect(getBlockAudioText({
            type: 'control_forever',
            toString: () => 'forever'
        }, 'name', 'en', {})).toBe('forever loop');
        expect(getBlockAudioText({
            type: 'control_repeat',
            toString: () => 'repeat 10'
        }, 'name', 'en', {})).toBe('repeat 10 times loop');
    });

    test('keeps loop wording for loop blocks without rendered text', () => {
        expect(getBlockAudioText({type: 'control_forever'}, 'name', 'en', {})).toBe('forever loop');
        expect(getBlockAudioText({type: 'control_repeat_until'}, 'name', 'en', {})).toBe('repeat until loop');
    });

    test('returns local French fallback text when locale is French', () => {
        expect(getBlockAudioText({type: 'motion_movesteps'}, 'explanation', 'fr', {}))
            .toBe('Ce bloc fait avancer le lutin du nombre de pas choisi.');
    });

    test('returns a specific French explanation for sound blocks', () => {
        expect(getBlockAudioText({type: 'sound_play'}, 'explanation', 'fr', {}))
            .toBe('Ce bloc demarre le son choisi. Le script peut continuer sans attendre la fin du son.');
    });

    test('returns detailed catalog explanations for core blocks', () => {
        expect(getBlockAudioText({type: 'motion_changexby'}, 'explanation', 'en', {}))
            .toBe('This block moves the sprite left or right. A bigger x number moves it right. ' +
                'A smaller or negative number moves it left.');
        expect(getBlockAudioText({type: 'control_forever'}, 'explanation', 'en', {}))
            .toBe('This forever loop keeps running the blocks inside it over and over until the project stops.');
    });

    test('explains custom procedure blocks with the sprite ownership constraint', () => {
        expect(getBlockAudioText({
            type: 'procedures_call',
            mutation: {
                proccode: 'jump'
            }
        }, 'explanation', 'en', {})).toBe(
            'This is a custom jump block. The programmer grouped several instructions together and gave them ' +
            'the name jump. One important constraint: a custom block belongs to the sprite where it was created; ' +
            'it is not automatically available to every sprite.'
        );
    });

    test('explains starter palette blocks as templates with child-defined details', () => {
        expect(getBlockAudioText({type: 'starter_drawshape'}, 'explanation', 'en', {})).toBe(
            'This starter block means draw a shape with code. It does not decide the shape by itself. The ' +
            'child chooses the shape, such as a square, triangle, or circle, by adding pen and movement blocks.'
        );
    });

    test('explains specialised audio-spatial blocks semantically', () => {
        expect(getBlockAudioText({type: 'specialised_playsoundfromdirection'}, 'explanation', 'en', {})).toBe(
            'This audio-spatial block plays a sound as if it comes from a direction. Negative numbers ' +
            'mean left, zero means centre, and positive numbers mean right.'
        );
    });

    test('falls back to English catalog explanations when a locale entry is missing', () => {
        expect(getCatalogExplanation('motion_setx', 'fr')).toBe(
            'This block puts the sprite at the x position you choose. X controls left and right.'
        );
    });

    test('uses provided locale messages before local fallback messages', () => {
        const localeMessages = {
            'gui.blockAudio.motionMoveSteps.name': 'message fourni'
        };

        expect(getBlockAudioText({type: 'motion_movesteps'}, 'name', 'fr', localeMessages)).toBe('message fourni');
    });

    test('returns fallback text for unknown blocks', () => {
        expect(getBlockAudioText({type: 'unknown_block'}, 'name', 'en', {})).toBe('block');
    });

    test('formats message descriptors with locale messages', () => {
        const localeMessages = {
            'gui.blockAudio.fallback.name': 'bloc localise'
        };

        expect(formatMessage(messages.fallbackName, 'en', localeMessages)).toBe('bloc localise');
    });

    test('normalizes locale for speech synthesis', () => {
        expect(normalizeLocale('fr_FR')).toBe('fr-fr');
    });
});
