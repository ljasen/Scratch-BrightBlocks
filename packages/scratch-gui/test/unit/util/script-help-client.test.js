import {requestScriptHelp} from '../../../src/lib/block-audio/script-help-client';

describe('requestScriptHelp', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        delete global.fetch;
    });

    test('posts script help requests to the proxy', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({text: 'Try checking the event block.'})
        });

        const text = await requestScriptHelp({
            context: {selectedBlock: {type: 'event_whenflagclicked'}},
            mode: 'hint',
            locale: 'en'
        });

        expect(text).toBe('Try checking the event block.');
        expect(global.fetch).toHaveBeenCalledWith(
            'http://127.0.0.1:8602/api/script-help',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    context: {selectedBlock: {type: 'event_whenflagclicked'}},
                    mode: 'hint',
                    locale: 'en'
                })
            })
        );
    });

    test('throws proxy errors', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({error: 'Set OPENAI_API_KEY'})
        });

        await expect(requestScriptHelp({
            context: {},
            mode: 'hint',
            locale: 'en'
        })).rejects.toThrow('Set OPENAI_API_KEY');
    });
});
