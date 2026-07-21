import SpeechSynthesizer, {cleanSpokenText} from '../../../src/lib/block-audio/speech-synthesizer';

describe('SpeechSynthesizer', () => {
    let originalUtterance;

    beforeEach(() => {
        originalUtterance = global.SpeechSynthesisUtterance;
        global.SpeechSynthesisUtterance = function (text) {
            this.text = text;
        };
    });

    afterEach(() => {
        global.SpeechSynthesisUtterance = originalUtterance;
    });

    test('speaks text using the requested locale', () => {
        const speechSynthesis = {
            cancel: jest.fn(),
            speak: jest.fn()
        };
        const synthesizer = new SpeechSynthesizer(() => speechSynthesis);

        expect(synthesizer.speak('Bonjour', 'fr_FR')).toBe(true);
        expect(speechSynthesis.cancel).toHaveBeenCalled();
        expect(speechSynthesis.speak).toHaveBeenCalledWith(expect.objectContaining({
            lang: 'fr-fr',
            text: 'Bonjour'
        }));
    });

    test('calls onEnd when speech finishes', () => {
        const speechSynthesis = {
            cancel: jest.fn(),
            speak: jest.fn()
        };
        const synthesizer = new SpeechSynthesizer(() => speechSynthesis);
        const onEnd = jest.fn();

        synthesizer.speak('Bonjour', 'fr', onEnd);
        speechSynthesis.speak.mock.calls[0][0].onend();

        expect(onEnd).toHaveBeenCalled();
    });

    test('returns false when speech synthesis is unavailable', () => {
        const synthesizer = new SpeechSynthesizer(() => null);

        expect(synthesizer.speak('Hello', 'en')).toBe(false);
    });

    test('removes asterisks before speaking', () => {
        const speechSynthesis = {
            cancel: jest.fn(),
            speak: jest.fn()
        };
        const synthesizer = new SpeechSynthesizer(() => speechSynthesis);

        synthesizer.speak('**Try to** check the blocks.', 'en');

        expect(speechSynthesis.speak).toHaveBeenCalledWith(expect.objectContaining({
            text: 'Try to check the blocks.'
        }));
    });

    test('cleans text for speech', () => {
        expect(cleanSpokenText('**Tips:**  Try   this.')).toBe('Tips: Try this.');
    });
});
