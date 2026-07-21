import {normalizeLocale} from './text';

const cleanSpokenText = text => (
    String(text || '')
        .replace(/\*/g, '')
        .replace(/\s+/g, ' ')
        .trim()
);

class SpeechSynthesizer {
    constructor (speechSynthesisGetter = () => (
        typeof window === 'undefined' ? null : window.speechSynthesis
    )) {
        this._speechSynthesisGetter = speechSynthesisGetter;
    }

    speak (text, locale, onEnd) {
        const spokenText = cleanSpokenText(text);
        const speechSynthesis = this._speechSynthesisGetter();
        if (!speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined' || !spokenText) {
            if (onEnd) onEnd();
            return false;
        }

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = normalizeLocale(locale);
        if (onEnd) {
            utterance.onend = onEnd;
            utterance.onerror = onEnd;
        }
        speechSynthesis.speak(utterance);
        return true;
    }
}

export {
    cleanSpokenText
};
export default SpeechSynthesizer;
