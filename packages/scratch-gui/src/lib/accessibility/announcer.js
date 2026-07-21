const ANNOUNCE_EVENT = 'scratch-accessibility-announce';

const announceForAccessibility = message => {
    if (typeof window === 'undefined' || !message) return;
    window.dispatchEvent(new CustomEvent(ANNOUNCE_EVENT, {
        detail: {
            message
        }
    }));
};

export {
    ANNOUNCE_EVENT,
    announceForAccessibility
};
