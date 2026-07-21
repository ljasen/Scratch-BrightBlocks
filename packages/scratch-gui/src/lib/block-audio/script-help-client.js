const getHelpUrl = () => process.env.SCRATCH_AI_HELP_URL || 'http://127.0.0.1:8602/api/script-help';

const requestScriptHelp = async ({context, mode, locale}) => {
    const response = await fetch(getHelpUrl(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            context,
            mode,
            locale
        })
    });
    const body = await response.json();
    if (!response.ok) {
        throw new Error(body.error || 'Script help failed');
    }
    return body.text;
};

export {
    requestScriptHelp
};
