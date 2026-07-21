import http from 'node:http';

const PORT = Number(process.env.SCRATCH_AI_HELP_PORT || 8602);
const MODEL = process.env.SCRATCH_AI_HELP_MODEL || 'gpt-5.4-mini';
const API_KEY = process.env.OPENAI_API_KEY;

const writeJson = (response, statusCode, body) => {
    response.writeHead(statusCode, {
        'Access-Control-Allow-Headers': 'content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': process.env.SCRATCH_AI_HELP_ORIGIN || 'http://127.0.0.1:8601',
        'Content-Type': 'application/json'
    });
    response.end(JSON.stringify(body));
};

const readRequestBody = request => new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
        body += chunk;
        if (body.length > 100000) {
            request.destroy(new Error('Request body too large'));
        }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
});

const extractOutputText = responseBody => {
    if (typeof responseBody.output_text === 'string') return responseBody.output_text;
    if (!Array.isArray(responseBody.output)) return '';

    return responseBody.output
        .flatMap(item => item.content || [])
        .filter(content => content.type === 'output_text' && typeof content.text === 'string')
        .map(content => content.text)
        .join('\n')
        .trim();
};

const extractUsage = responseBody => {
    const usage = responseBody.usage || {};
    return {
        inputTokens: usage.input_tokens || 0,
        outputTokens: usage.output_tokens || 0,
        totalTokens: usage.total_tokens || 0
    };
};

const compactBlock = block => {
    if (!block) return null;
    const compact = {
        t: block.type,
        x: block.text
    };
    if (block.fields && Object.keys(block.fields).length) {
        compact.f = block.fields;
    }
    if (block.inputs && Object.keys(block.inputs).length) {
        compact.i = Object.keys(block.inputs).reduce((inputs, inputName) => {
            const input = compactBlock(block.inputs[inputName]);
            if (input) inputs[inputName] = input;
            return inputs;
        }, {});
    }
    if (block.next) {
        compact.n = compactBlock(block.next);
    }
    return compact;
};

const compactContext = context => ({
    b: compactBlock(context.selectedBlock),
    s: compactBlock(context.selectedScript),
    c: context.connections,
    o: (context.workspaceScripts || []).map(compactBlock).filter(Boolean),
    oc: context.workspaceScriptCount,
    ot: context.workspaceScriptsTruncated
});

const buildInstructions = ({mode, locale}) => {
    const wantsSolution = mode === 'solution';
    return [
        'Help a 5 to 6 year old debug a Scratch script.',
        'Use short, kind, simple sentences.',
        'Inspect selected block b, script s, connections c, then other stacks o.',
        'Check for a disconnected stack, missing event/start block, missing loop, wrong order, or custom block issue.',
        'Use only the JSON context. Separate stacks are not connected.',
        wantsSolution ?
            'Second help press: give the likely fix.' :
            'First help press: give clues, not the exact fix.',
        'No Markdown, bullets, headings, asterisks, or the word "tips".',
        'Sound conversational. Say "Try to..." or "Can you check..."',
        `Reply in ${locale && locale.toLowerCase().startsWith('fr') ? 'French' : 'English'}.`
    ].join('\n');
};

const buildInput = ({context}) => `Scratch JSON: ${JSON.stringify(compactContext(context || {}))}`;

const callOpenAI = async payload => {
    const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: MODEL,
            instructions: buildInstructions(payload),
            input: buildInput(payload),
            max_output_tokens: 180
        })
    });

    const responseBody = await openAIResponse.json();
    if (!openAIResponse.ok) {
        throw new Error(responseBody.error?.message || `OpenAI request failed with ${openAIResponse.status}`);
    }

    const text = extractOutputText(responseBody);
    if (!text) throw new Error('OpenAI response did not include text');
    return {
        text,
        usage: extractUsage(responseBody)
    };
};

const server = http.createServer(async (request, response) => {
    if (request.method === 'OPTIONS') {
        return writeJson(response, 204, {});
    }

    if (request.method !== 'POST' || request.url !== '/api/script-help') {
        return writeJson(response, 404, {error: 'Not found'});
    }

    if (!API_KEY) {
        return writeJson(response, 503, {
            error: 'Set OPENAI_API_KEY before starting the local dev server.'
        });
    }

    try {
        const body = await readRequestBody(request);
        const payload = JSON.parse(body);
        const result = await callOpenAI(payload);
        console.log(
            `OpenAI ${MODEL} usage: ` +
            `${result.usage.inputTokens} input, ` +
            `${result.usage.outputTokens} output, ` +
            `${result.usage.totalTokens} total tokens`
        );
        return writeJson(response, 200, result);
    } catch (error) {
        return writeJson(response, 500, {
            error: error.message || 'Script help failed'
        });
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Scratch AI help proxy listening on http://127.0.0.1:${PORT}/api/script-help`);
});
