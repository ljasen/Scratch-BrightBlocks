import messages from './messages';
import {requestScriptHelp} from './script-help-client';
import {explainScript, explainScriptSteps} from './script-explainer';
import {formatMessage, getBlockAudioText, getBlockType} from './text';
import {announceForAccessibility} from '../accessibility/announcer';
import SpeechSynthesizer from './speech-synthesizer';

const DEFAULT_HOVER_DELAY = 500;
const SELECTED_BLOCK_CLASS = 'block-audio-selected-block';

const CREATE_COMMANDS = [
    {
        id: 'create-event-whenflagclicked',
        label: messages.blockCommandWhenGreenFlag,
        type: 'event_whenflagclicked'
    },
    {
        id: 'create-motion-movesteps',
        label: messages.blockCommandMoveSteps,
        type: 'motion_movesteps',
        inputs: {
            STEPS: {
                type: 'math_number',
                fields: {
                    NUM: '10'
                }
            }
        }
    },
    {
        id: 'create-motion-turnright',
        label: messages.blockCommandTurnRight,
        type: 'motion_turnright',
        inputs: {
            DEGREES: {
                type: 'math_number',
                fields: {
                    NUM: '15'
                }
            }
        }
    },
    {
        id: 'create-looks-say',
        label: messages.blockCommandSayHello,
        type: 'looks_say',
        inputs: {
            MESSAGE: {
                type: 'text',
                fields: {
                    TEXT: 'Hello!'
                }
            }
        }
    },
    {
        id: 'create-sound-play',
        label: messages.blockCommandPlaySound,
        type: 'sound_play',
        inputs: {
            SOUND_MENU: {
                type: 'sound_sounds_menu'
            }
        }
    },
    {
        id: 'create-control-wait',
        label: messages.blockCommandWait,
        type: 'control_wait',
        inputs: {
            DURATION: {
                type: 'math_positive_number',
                fields: {
                    NUM: '1'
                }
            }
        }
    },
    {
        id: 'create-control-repeat',
        label: messages.blockCommandRepeat,
        type: 'control_repeat',
        inputs: {
            TIMES: {
                type: 'math_whole_number',
                fields: {
                    NUM: '10'
                }
            }
        }
    },
    {
        id: 'create-control-forever',
        label: messages.blockCommandForever,
        type: 'control_forever'
    }
];

class BlockAudioController {
    constructor ({
        ScratchBlocks,
        workspace,
        rootElement,
        getLocale,
        getMessages,
        getHoverDelay = () => DEFAULT_HOVER_DELAY,
        synthesizer = new SpeechSynthesizer()
    }) {
        this.ScratchBlocks = ScratchBlocks;
        this.workspace = workspace;
        this.rootElement = rootElement;
        this.getLocale = getLocale;
        this.getMessages = getMessages;
        this.getHoverDelay = getHoverDelay;
        this.synthesizer = synthesizer;
        this._lastSpokenBlockId = null;
        this._selectedBlockId = null;
        this._lastInteractedBlockId = null;
        this._lastClickedBlockId = null;
        this._lastHoveredBlockId = null;
        this._selectedHighlightElement = null;
        this._glowingBlockIds = [];
        this._lastHelpSignature = null;
        this._lastHelpMode = 'hint';

        this._handleWorkspaceEvent = this._handleWorkspaceEvent.bind(this);
        this._handleMouseOver = this._handleMouseOver.bind(this);
        this._handleMouseOut = this._handleMouseOut.bind(this);
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleFocusIn = this._handleFocusIn.bind(this);

        this.workspace.addChangeListener(this._handleWorkspaceEvent);
        if (this.rootElement) {
            this.rootElement.addEventListener('mouseover', this._handleMouseOver);
            this.rootElement.addEventListener('mouseout', this._handleMouseOut);
            this.rootElement.addEventListener('mousedown', this._handleMouseDown);
            this.rootElement.addEventListener('focusin', this._handleFocusIn);
        }
    }

    dispose () {
        clearTimeout(this._hoverTimeout);
        this._clearSelectedHighlight();
        this._clearGuidedHighlights();
        this.workspace.removeChangeListener(this._handleWorkspaceEvent);
        if (this.rootElement) {
            this.rootElement.removeEventListener('mouseover', this._handleMouseOver);
            this.rootElement.removeEventListener('mouseout', this._handleMouseOut);
            this.rootElement.removeEventListener('mousedown', this._handleMouseDown);
            this.rootElement.removeEventListener('focusin', this._handleFocusIn);
        }
    }

    speakBlock (block, mode = 'name') {
        const text = getBlockAudioText(block, mode, this.getLocale(), this.getMessages());
        return this.synthesizer.speak(text, this.getLocale());
    }

    explainSelectedBlock () {
        const block = this.getCurrentBlock();
        if (!block) {
            const text = formatMessage(
                messages.noSelectedBlockExplanation,
                this.getLocale(),
                this.getMessages()
            );
            return this.synthesizer.speak(text, this.getLocale());
        }
        const scriptBlock = this.getScriptRootBlock(block);
        const scriptSteps = explainScriptSteps(scriptBlock, this.getLocale(), this.getMessages());
        if (scriptSteps.length > 0) {
            return this._speakGuidedSteps(scriptSteps);
        }
        const scriptExplanation = explainScript(scriptBlock, this.getLocale(), this.getMessages());
        if (scriptExplanation) {
            return this.synthesizer.speak(scriptExplanation, this.getLocale());
        }
        return this.speakBlock(block, 'explanation');
    }

    helpSelectedScript () {
        const block = this.getCurrentBlock();
        if (!block) {
            const text = formatMessage(
                messages.noSelectedBlockHelp,
                this.getLocale(),
                this.getMessages()
            );
            return this.synthesizer.speak(text, this.getLocale());
        }

        const context = this.serializeHelpContext(block);
        const signature = JSON.stringify(context);
        const mode = signature === this._lastHelpSignature && this._lastHelpMode === 'hint' ?
            'solution' :
            'hint';
        this._lastHelpSignature = signature;
        this._lastHelpMode = mode;

        this.synthesizer.speak(formatMessage(
            messages.helpWaiting,
            this.getLocale(),
            this.getMessages()
        ), this.getLocale());

        return requestScriptHelp({
            context,
            mode,
            locale: this.getLocale()
        })
            .then(text => this.synthesizer.speak(text, this.getLocale()))
            .catch(() => this.synthesizer.speak(formatMessage(
                messages.helpError,
                this.getLocale(),
                this.getMessages()
            ), this.getLocale()));
    }

    serializeScript (block) {
        return this._serializeBlock(block, new Set());
    }

    serializeHelpContext (selectedBlock) {
        const scriptRoot = this.getScriptRootBlock(selectedBlock);
        const topBlocks = this.workspace && typeof this.workspace.getTopBlocks === 'function' ?
            this.workspace.getTopBlocks(false) :
            [scriptRoot];
        const otherTopBlocks = topBlocks.filter(block => !scriptRoot || block.id !== scriptRoot.id);
        const workspaceScripts = otherTopBlocks
            .slice(0, 2)
            .map(block => this.serializeScript(block))
            .filter(Boolean);
        const previousBlock = typeof selectedBlock.getPreviousBlock === 'function' ?
            selectedBlock.getPreviousBlock() : null;
        const parentBlock = typeof selectedBlock.getParent === 'function' ? selectedBlock.getParent() : null;
        const surroundingBlock = typeof selectedBlock.getSurroundParent === 'function' ?
            selectedBlock.getSurroundParent() : null;
        const nextBlock = this._getNextBlock(selectedBlock);

        return {
            selectedBlock: this._serializeBlockSummary(selectedBlock),
            selectedScript: this.serializeScript(scriptRoot),
            connections: {
                isTopLevel: selectedBlock.id === scriptRoot.id,
                hasPreviousBlock: Boolean(previousBlock),
                previousBlockType: previousBlock ? previousBlock.type : null,
                hasNextBlock: Boolean(nextBlock),
                nextBlockType: nextBlock ? nextBlock.type : null,
                parentBlockType: parentBlock ? parentBlock.type : null,
                surroundingBlockType: surroundingBlock ? surroundingBlock.type : null,
                startsWithEvent: Boolean(scriptRoot.type && scriptRoot.type.startsWith('event_'))
            },
            workspaceScripts,
            workspaceScriptCount: topBlocks.length,
            workspaceScriptsTruncated: otherTopBlocks.length > workspaceScripts.length
        };
    }

    _serializeBlock (block, seen) {
        if (!block || seen.has(block.id)) return null;
        seen.add(block.id);
        return {
            id: block.id,
            type: block.type,
            text: typeof block.toString === 'function' ? block.toString() : '',
            fields: this._serializeFields(block),
            inputs: this._serializeInputs(block, seen),
            next: this._serializeBlock(this._getNextBlock(block), seen)
        };
    }

    _serializeBlockSummary (block) {
        if (!block) return null;
        return {
            id: block.id,
            type: block.type,
            text: typeof block.toString === 'function' ? block.toString() : '',
            fields: this._serializeFields(block)
        };
    }

    _serializeFields (block) {
        if (!block.inputList) return {};
        return block.inputList.reduce((fields, input) => {
            if (!input.fieldRow) return fields;
            input.fieldRow.forEach(field => {
                const name = field.name || field.name_;
                if (!name) return;
                fields[name] = typeof field.getValue === 'function' ? field.getValue() : field.value_;
            });
            return fields;
        }, {});
    }

    _serializeInputs (block, seen) {
        if (!block.inputList) return {};
        return block.inputList.reduce((inputs, input) => {
            const target = input.connection && typeof input.connection.targetBlock === 'function' ?
                input.connection.targetBlock() :
                null;
            if (target) {
                inputs[input.name] = this._serializeBlock(target, seen);
            }
            return inputs;
        }, {});
    }

    _getNextBlock (block) {
        if (!block || typeof block.getNextBlock !== 'function') return null;
        return block.getNextBlock();
    }

    _speakGuidedSteps (steps, index = 0) {
        this._clearGuidedHighlights();
        const step = steps[index];
        if (!step) return true;

        this._setGuidedHighlights(step.blockIds, true);
        return this.synthesizer.speak(step.text, this.getLocale(), () => {
            this._clearGuidedHighlights();
            this._speakGuidedSteps(steps, index + 1);
        });
    }

    _setGuidedHighlights (blockIds, isGlowing) {
        if (!this.ScratchBlocks || typeof this.ScratchBlocks.glowStack !== 'function') return;
        blockIds.forEach(blockId => {
            try {
                this.ScratchBlocks.glowStack(blockId, isGlowing);
            } catch {
                // The block may have been moved, deleted, or hidden while speech was playing.
            }
        });
        this._glowingBlockIds = isGlowing ? blockIds : [];
    }

    _clearGuidedHighlights () {
        this._setGuidedHighlights(this._glowingBlockIds, false);
    }

    getSelectedBlock () {
        return this._getBlocklySelectedBlock() || this._getBlockById(this._selectedBlockId);
    }

    getCurrentBlock () {
        const selectedBlock = this.getSelectedBlock();
        if (selectedBlock) {
            this._setSelectedBlockId(selectedBlock.id);
            return selectedBlock;
        }

        return this._getBlockById(
            this._selectedBlockId ||
            this._lastClickedBlockId ||
            this._lastInteractedBlockId ||
            this._lastHoveredBlockId
        );
    }

    _getBlockById (blockId) {
        if (!blockId || !this.workspace || typeof this.workspace.getBlockById !== 'function') return null;
        return this.workspace.getBlockById(blockId);
    }

    _getBlocklySelectedBlock () {
        if (this.workspace && typeof this.workspace.getSelected === 'function') {
            const workspaceSelected = this.workspace.getSelected();
            if (workspaceSelected && workspaceSelected.id && this._isWorkspaceBlock(workspaceSelected)) {
                return workspaceSelected;
            }
        }

        return null;
    }

    _isWorkspaceBlock (block) {
        if (!block || !this.workspace) return false;
        if (block.workspace && block.workspace !== this.workspace) return false;
        return !block.isInFlyout;
    }

    getScriptRootBlock (block) {
        if (!block || typeof block.getRootBlock !== 'function') return block;
        return block.getRootBlock() || block;
    }

    navigateScript (command) {
        const currentBlock = this.getCurrentBlock();
        if (!currentBlock) {
            const text = formatMessage(
                messages.noSelectedBlockExplanation,
                this.getLocale(),
                this.getMessages()
            );
            this.synthesizer.speak(text, this.getLocale());
            return false;
        }

        if (command === 'root') {
            return this._focusBlockWithLocation(this.getScriptRootBlock(currentBlock));
        }
        if (command === 'next-stack') {
            return this._focusNextStack(currentBlock);
        }
        if (command === 'parent') {
            const parent = this._getContainingParent(currentBlock);
            return parent ? this._focusBlockWithLocation(parent) : this._speakNavigationBoundary();
        }
        if (command === 'child') {
            const child = this._getInputChildren(currentBlock)[0];
            return child ? this._focusBlockWithLocation(child) : this._speakNavigationBoundary();
        }

        const scriptBlocks = this._getScriptNavigationBlocks(currentBlock);
        const currentIndex = scriptBlocks.findIndex(item => item.block.id === currentBlock.id);
        const direction = command === 'previous' ? -1 : 1;
        const nextItem = scriptBlocks[currentIndex + direction];
        return nextItem ? this._focusBlockWithLocation(nextItem.block, scriptBlocks) : this._speakNavigationBoundary();
    }

    getSearchableBlocks (query = '') {
        if (!this.workspace || typeof this.workspace.getAllBlocks !== 'function') return [];
        const normalizedQuery = query.toLowerCase().trim();
        return this.workspace.getAllBlocks(false)
            .map(block => ({
                id: block.id,
                text: typeof block.toString === 'function' ? block.toString() : getBlockAudioText(
                    block,
                    'name',
                    this.getLocale(),
                    this.getMessages()
                ),
                type: block.type || ''
            }))
            .filter(item => item.text && (
                !normalizedQuery ||
                item.text.toLowerCase().includes(normalizedQuery) ||
                item.type.toLowerCase().includes(normalizedQuery)
            ))
            .slice(0, 20);
    }

    getCommandPaletteItems (query = '') {
        const createPrefix = formatMessage(messages.blockCommandCreatePrefix, this.getLocale(), this.getMessages());
        const findPrefix = formatMessage(messages.blockCommandFindPrefix, this.getLocale(), this.getMessages());
        const createItems = CREATE_COMMANDS.map(command => {
            const label = formatMessage(command.label, this.getLocale(), this.getMessages());
            return {
                id: command.id,
                action: 'create',
                text: `${createPrefix} ${label}`,
                type: command.type
            };
        });
        const findItems = this.getSearchableBlocks(query).map(block => ({
            ...block,
            action: 'find',
            text: `${findPrefix} ${block.text}`
        }));
        const normalizedQuery = query.toLowerCase().trim();
        return createItems
            .concat(findItems)
            .filter(item => !normalizedQuery || (
                item.text.toLowerCase().includes(normalizedQuery) ||
                item.type.toLowerCase().includes(normalizedQuery)
            ))
            .slice(0, 30);
    }

    runCommandPaletteItem (item) {
        if (!item) return false;
        if (item.action === 'create') {
            return this.createBlockFromCommand(item.id);
        }
        if (item.action === 'find') {
            return this.focusBlockById(item.id);
        }
        return false;
    }

    createBlockFromCommand (commandId) {
        const command = CREATE_COMMANDS.find(item => item.id === commandId);
        if (!command || !this.workspace || typeof this.workspace.newBlock !== 'function') return false;
        const block = this.workspace.newBlock(command.type);
        this._connectShadowInputs(block, command.inputs || {});
        this._finishNewBlock(block);
        this._focusBlock(block);
        const createdText = formatMessage(messages.blockCommandCreated, this.getLocale(), this.getMessages());
        const blockText = getBlockAudioText(block, 'name', this.getLocale(), this.getMessages());
        announceForAccessibility(`${createdText} ${blockText}`);
        return true;
    }

    _connectShadowInputs (block, inputs) {
        Object.keys(inputs).forEach(inputName => {
            const input = typeof block.getInput === 'function' ? block.getInput(inputName) : null;
            if (!input || !input.connection) return;
            const shadowInfo = inputs[inputName];
            const shadowBlock = this.workspace.newBlock(shadowInfo.type);
            Object.keys(shadowInfo.fields || {}).forEach(fieldName => {
                shadowBlock.setFieldValue(shadowInfo.fields[fieldName], fieldName);
            });
            if (typeof shadowBlock.setShadow === 'function') {
                shadowBlock.setShadow(true);
            }
            this._finishNewBlock(shadowBlock, false);
            if (shadowBlock.outputConnection) {
                shadowBlock.outputConnection.connect(input.connection);
            }
        });
    }

    _finishNewBlock (block, shouldMove = true) {
        if (typeof block.initSvg === 'function') block.initSvg();
        if (typeof block.render === 'function') block.render();
        if (shouldMove && typeof block.moveBy === 'function') {
            const position = this._getNewBlockPosition();
            block.moveBy(position.x, position.y);
        }
        this._fireCreateEvent(block);
    }

    _getNewBlockPosition () {
        const metrics = typeof this.workspace.getMetrics === 'function' ? this.workspace.getMetrics() : null;
        const scale = this.workspace.scale || 1;
        if (!metrics) {
            return {x: 40, y: 40};
        }
        return {
            x: ((-this.workspace.scrollX) + (metrics.viewWidth / 2)) / scale,
            y: ((-this.workspace.scrollY) + (metrics.viewHeight / 3)) / scale
        };
    }

    _fireCreateEvent (block) {
        const Events = this.ScratchBlocks && this.ScratchBlocks.Events;
        if (!Events || typeof Events.fire !== 'function' || typeof Events.get !== 'function') return;
        const BlockCreate = Events.get(Events.BLOCK_CREATE);
        if (BlockCreate) {
            Events.fire(new BlockCreate(block));
        }
    }

    focusBlockById (blockId) {
        const block = this.workspace.getBlockById(blockId);
        if (!block) return false;
        return this._focusBlock(block);
    }

    _focusBlock (block, shouldSpeak = true, shouldAnnounce = true) {
        const blockId = block.id;
        if (typeof block.select === 'function') {
            block.select();
        }
        if (typeof this.workspace.centerOnBlock === 'function') {
            this.workspace.centerOnBlock(blockId);
        }
        this._setSelectedBlockId(blockId);
        this._lastClickedBlockId = blockId;
        const text = getBlockAudioText(block, 'name', this.getLocale(), this.getMessages());
        if (shouldAnnounce) {
            announceForAccessibility(text);
        }
        if (shouldSpeak) {
            this.speakBlock(block, 'name');
        }
        return true;
    }

    _setSelectedBlockId (blockId) {
        if (this._selectedBlockId === blockId) {
            this._setSelectedHighlight(blockId);
            return;
        }
        this._selectedBlockId = blockId || null;
        this._lastInteractedBlockId = this._selectedBlockId || this._lastInteractedBlockId;
        this._setSelectedHighlight(this._selectedBlockId);
    }

    _setSelectedHighlight (blockId) {
        const element = this._getBlockElementById(blockId);
        if (this._selectedHighlightElement === element) return;
        this._clearSelectedHighlight();
        if (!element || !element.classList) return;
        element.classList.add(SELECTED_BLOCK_CLASS);
        this._selectedHighlightElement = element;
    }

    _clearSelectedHighlight () {
        if (this._selectedHighlightElement && this._selectedHighlightElement.classList) {
            this._selectedHighlightElement.classList.remove(SELECTED_BLOCK_CLASS);
        }
        this._selectedHighlightElement = null;
    }

    _getBlockElementById (blockId) {
        if (!blockId || !this.rootElement || typeof this.rootElement.querySelector !== 'function') return null;
        const escapedBlockId = this._escapeCssIdentifier(blockId);
        return this.rootElement.querySelector(`[data-id="${escapedBlockId}"], [data-block-id="${escapedBlockId}"]`) ||
            this.rootElement.querySelector(`#${escapedBlockId}`);
    }

    _escapeCssIdentifier (value) {
        if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
        return String(value).replace(/["\\#.:,[\]]/g, '\\$&');
    }

    _focusBlockWithLocation (block, scriptBlocks = null) {
        if (!block) return false;
        const didFocus = this._focusBlock(block, false, false);
        if (!didFocus) return false;
        const text = this._getNavigationSpeech(block, scriptBlocks);
        announceForAccessibility(text);
        this.synthesizer.speak(text, this.getLocale());
        return true;
    }

    _speakNavigationBoundary () {
        const text = this._isFrenchLocale() ? 'Aucun autre bloc dans cette direction.' : 'No more blocks this way.';
        announceForAccessibility(text);
        this.synthesizer.speak(text, this.getLocale());
        return false;
    }

    _focusNextStack (currentBlock) {
        const roots = this._getTopBlocks();
        if (!roots.length) return this._speakNavigationBoundary();
        const currentRoot = this.getScriptRootBlock(currentBlock);
        const currentIndex = roots.findIndex(block => block.id === currentRoot.id);
        if (currentIndex < 0) return this._focusBlockWithLocation(roots[0]);
        const nextRoot = roots[currentIndex + 1] || roots[0];
        return this._focusBlockWithLocation(nextRoot);
    }

    _getTopBlocks () {
        if (this.workspace && typeof this.workspace.getTopBlocks === 'function') {
            return this.workspace.getTopBlocks(true) || [];
        }
        if (!this.workspace || typeof this.workspace.getAllBlocks !== 'function') return [];
        return this.workspace.getAllBlocks(false).filter(block => this.getScriptRootBlock(block) === block);
    }

    _getScriptNavigationBlocks (currentBlock) {
        const root = this.getScriptRootBlock(currentBlock);
        return this._flattenScriptBlocks(root);
    }

    _flattenScriptBlocks (block, container = null, seen = new Set()) {
        if (!block || seen.has(block.id)) return [];
        seen.add(block.id);
        const items = [{
            block,
            container
        }];
        this._getInputChildren(block).forEach(child => {
            items.push(...this._flattenScriptBlocks(child, block, seen));
        });
        items.push(...this._flattenScriptBlocks(this._getNextBlock(block), container, seen));
        return items;
    }

    _getInputChildren (block) {
        if (!block || !block.inputList) return [];
        return block.inputList
            .map(input => {
                if (typeof block.getInputTargetBlock === 'function' && input.name) {
                    const target = block.getInputTargetBlock(input.name);
                    if (target) return target;
                }
                return input.connection && typeof input.connection.targetBlock === 'function' ?
                    input.connection.targetBlock() :
                    null;
            })
            .filter(Boolean);
    }

    _getContainingParent (block) {
        if (!block) return null;
        if (typeof block.getSurroundParent === 'function') {
            const surroundParent = block.getSurroundParent();
            if (surroundParent) return surroundParent;
        }
        if (typeof block.getParent === 'function') {
            return block.getParent();
        }
        return null;
    }

    _getNavigationSpeech (block, scriptBlocks = null) {
        const blocks = scriptBlocks || this._getScriptNavigationBlocks(block);
        const index = blocks.findIndex(item => item.block.id === block.id);
        const container = index >= 0 ? blocks[index].container || this._getContainingParent(block) : null;
        const location = index >= 0 ?
            this._formatBlockLocation(index + 1, blocks.length, container) :
            '';
        const blockText = getBlockAudioText(block, 'name', this.getLocale(), this.getMessages());
        return location ? `${location} ${blockText}.` : blockText;
    }

    _formatBlockLocation (position, total, container) {
        const containerText = container ?
            getBlockAudioText(container, 'name', this.getLocale(), this.getMessages()) :
            '';
        if (this._isFrenchLocale()) {
            return containerText ?
                `Bloc ${position} sur ${total}, dans ${containerText}.` :
                `Bloc ${position} sur ${total}.`;
        }
        return containerText ?
            `Block ${position} of ${total}, inside ${containerText}.` :
            `Block ${position} of ${total}.`;
    }

    _isFrenchLocale () {
        return (this.getLocale() || '')
            .toLowerCase()
            .replace('_', '-')
            .startsWith('fr');
    }

    _handleWorkspaceEvent (event) {
        const uiEventType = this.ScratchBlocks.Events.UI || 'ui';
        if (!event || event.type !== uiEventType || event.element !== 'selected') {
            return;
        }

        this._setSelectedBlockId(event.newValue || null);
        if (!event.newValue) return;

        const block = this.workspace.getBlockById(event.newValue);
        if (block) {
            this._lastSpokenBlockId = event.newValue;
            this.speakBlock(block, 'name');
        }
    }

    _handleMouseOver (event) {
        const blockId = this._getBlockIdFromElement(event.target);
        if (!blockId || blockId === this._lastSpokenBlockId) return;

        this._lastHoveredBlockId = blockId;
        clearTimeout(this._hoverTimeout);
        this._hoverTimeout = setTimeout(() => {
            const block = this.workspace.getBlockById(blockId);
            if (block) {
                this._lastSpokenBlockId = blockId;
                this.speakBlock(block, 'name');
            }
        }, this.getHoverDelay());
    }

    _handleMouseOut () {
        clearTimeout(this._hoverTimeout);
    }

    _handleMouseDown (event) {
        const blockId = this._getBlockIdFromElement(event.target);
        if (blockId) {
            const block = this.workspace.getBlockById(blockId);
            this._lastClickedBlockId = blockId;
            this._setSelectedBlockId(blockId);
            if (block && typeof block.select === 'function') {
                block.select();
            }
            if (getBlockType(block) && getBlockType(block).startsWith('procedures_')) {
                this._lastSpokenBlockId = blockId;
                this.speakBlock(block, 'explanation');
            }
        }
    }

    _handleFocusIn (event) {
        const audioLabel = this._getAudioLabelFromElement(event.target);
        if (audioLabel) {
            return this.synthesizer.speak(audioLabel, this.getLocale());
        }

        const blockId = this._getBlockIdFromElement(event.target);
        if (!blockId || blockId === this._lastSpokenBlockId) return false;
        const block = this.workspace.getBlockById(blockId);
        if (!block) return false;

        this._setSelectedBlockId(blockId);
        this._lastSpokenBlockId = blockId;
        return this.speakBlock(block, 'name');
    }

    _getAudioLabelFromElement (element) {
        let node = element;
        while (node && node !== this.rootElement) {
            if (node.getAttribute) {
                const label = node.getAttribute('data-audio-label');
                if (label) return label;
            }
            node = node.parentNode;
        }
        return '';
    }

    _getBlockIdFromElement (element) {
        let node = element;
        while (node && node !== this.rootElement) {
            if (node.getAttribute) {
                const blockId = node.getAttribute('data-id') || node.getAttribute('data-block-id');
                if (blockId) return blockId;
                if (node.classList && node.classList.contains('blocklyDraggable')) {
                    return node.id;
                }
            }
            node = node.parentNode;
        }
        return null;
    }
}

export default BlockAudioController;
