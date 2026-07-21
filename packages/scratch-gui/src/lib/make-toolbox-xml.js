import * as ScratchBlocks from 'scratch-blocks';
import {defaultColors} from './settings/color-mode';
import {SPECIALISED_BLOCK_CATEGORY_ID, SPECIALISED_BLOCK_CATEGORY_NAME, SPECIALISED_BLOCKS} from './specialised-blocks';
import {STARTER_BLOCK_CATEGORY_ID, STARTER_BLOCK_CATEGORY_NAME, STARTER_BLOCKS} from './starter-blocks';

const categorySeparator = '<sep gap="36"/>';

const blockSeparator = '<sep gap="36"/>'; // At default scale, about 28px

const categoryIconSvg = {
    motion: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<path d="M6 16h17" fill="none" stroke="#222" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M17 8l8 8-8 8" fill="none" stroke="#222" stroke-width="4" stroke-linecap="round" ' +
        'stroke-linejoin="round"/></svg>',
    looks: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<path d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16z" fill="none" stroke="#222" ' +
        'stroke-width="3" stroke-linejoin="round"/><circle cx="16" cy="16" r="4" fill="#222"/></svg>',
    sound: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<path d="M5 20h6l8 6V6l-8 6H5z" fill="none" stroke="#222" stroke-width="3" ' +
        'stroke-linejoin="round"/><path d="M23 11c2 3 2 7 0 10" fill="none" stroke="#222" ' +
        'stroke-width="3" stroke-linecap="round"/></svg>',
    events: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<path d="M8 27V5" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M9 6h16l-4 5 4 5H9z" fill="none" stroke="#222" stroke-width="3" ' +
        'stroke-linejoin="round"/></svg>',
    control: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<path d="M16 5v7m0 0l-7 7m7-7l7 7M9 19v8m14-8v8" fill="none" stroke="#222" ' +
        'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="12" r="3" ' +
        'fill="#222"/><circle cx="9" cy="27" r="2.5" fill="#222"/><circle cx="23" cy="27" r="2.5" ' +
        'fill="#222"/></svg>',
    sensing: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<circle cx="16" cy="16" r="3" fill="#222"/><circle cx="16" cy="16" r="8" fill="none" ' +
        'stroke="#222" stroke-width="3"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4" fill="none" ' +
        'stroke="#222" stroke-width="3" stroke-linecap="round"/></svg>',
    operators: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<path d="M8 10h8M12 6v8M18 22h8M18 18h8" fill="none" stroke="#222" stroke-width="3" ' +
        'stroke-linecap="round"/></svg>',
    variables: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<path d="M6 11l10-5 10 5v12l-10 5-10-5z" fill="none" stroke="#222" stroke-width="3" ' +
        'stroke-linejoin="round"/><path d="M6 11l10 5 10-5M16 16v12" fill="none" stroke="#222" ' +
        'stroke-width="3" stroke-linejoin="round"/></svg>',
    myBlocks: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<path d="M10 7h12v6h3a3 3 0 010 6h-3v6H10v-6H7a3 3 0 010-6h3z" fill="none" ' +
        'stroke="#222" stroke-width="3" stroke-linejoin="round"/></svg>',
    starter: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<path d="M16 5l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="none" stroke="#222" ' +
        'stroke-width="3" stroke-linejoin="round"/></svg>',
    specialised: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<circle cx="16" cy="16" r="4" fill="#222"/><path d="M16 4v5M16 23v5M4 16h5M23 16h5" ' +
        'fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/><path d="M8 8l4 4M20 20l4 4' +
        'M24 8l-4 4M12 20l-4 4" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/></svg>'
};

const categoryIconURI = (id, backgroundColor) => {
    const svg = categoryIconSvg[id]
        .replace('<svg ', '<svg ')
        .replace('viewBox="0 0 32 32">', `viewBox="0 0 32 32"><rect width="32" height="32" rx="7" ` +
            `fill="${backgroundColor}"/>`)
        .replace(/#222/g, '#fff');
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const categoryIconAttribute = (id, backgroundColor) => `iconURI="${categoryIconURI(id, backgroundColor)}"`;


const motion = function (isInitialSetup, isStage, targetId, colors) {
    const stageSelected = ScratchBlocks.ScratchMsgs.translate(
        'MOTION_STAGE_SELECTED',
        'Stage selected: no motion blocks'
    );
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    // Since Blockly uses the UK spelling of "colour", certain attributes are named accordingly.
    return `
    <category name="${ScratchBlocks.ScratchMsgs.translate(
        'CATEGORY_MOTION',
        'Motion'
    )}" toolboxitemid="motion" colour="${
        colors.colourPrimary
    }" secondaryColour="${colors.colourTertiary}" ${categoryIconAttribute('motion', colors.colourPrimary)}>
        ${isStage ? `
        <label text="${stageSelected}"></label>
        ` : `
        <block type="motion_movesteps">
            <value name="STEPS">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_turnright">
            <value name="DEGREES">
                <shadow type="math_number">
                    <field name="NUM">15</field>
                </shadow>
            </value>
        </block>
        <block type="motion_turnleft">
            <value name="DEGREES">
                <shadow type="math_number">
                    <field name="NUM">15</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_goto">
            <value name="TO">
                <shadow type="motion_goto_menu">
                </shadow>
            </value>
        </block>
        <block type="motion_gotoxy">
            <value name="X">
                <shadow id="movex" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Y">
                <shadow id="movey" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="motion_glideto" id="motion_glideto">
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="TO">
                <shadow type="motion_glideto_menu">
                </shadow>
            </value>
        </block>
        <block type="motion_glidesecstoxy">
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="X">
                <shadow id="glidex" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Y">
                <shadow id="glidey" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_pointindirection">
            <value name="DIRECTION">
                <shadow type="math_angle">
                    <field name="NUM">90</field>
                </shadow>
            </value>
        </block>
        <block type="motion_pointtowards">
            <value name="TOWARDS">
                <shadow type="motion_pointtowards_menu">
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_changexby">
            <value name="DX">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_setx">
            <value name="X">
                <shadow id="setx" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="motion_changeyby">
            <value name="DY">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_sety">
            <value name="Y">
                <shadow id="sety" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_ifonedgebounce"/>
        ${blockSeparator}
        <block type="motion_setrotationstyle"/>
        ${blockSeparator}
        <block id="${targetId}_xposition" type="motion_xposition"/>
        <block id="${targetId}_yposition" type="motion_yposition"/>
        <block id="${targetId}_direction" type="motion_direction"/>`}
        ${categorySeparator}
    </category>
    `;
};

const xmlEscape = function (unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        }
    });
};

const looks = function (isInitialSetup, isStage, targetId, costumeName, backdropName, colors) {
    const hello = ScratchBlocks.ScratchMsgs.translate('LOOKS_HELLO', 'Hello!');
    const hmm = ScratchBlocks.ScratchMsgs.translate('LOOKS_HMM', 'Hmm...');
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category name="${ScratchBlocks.ScratchMsgs.translate(
        'CATEGORY_LOOKS',
        'Looks'
    )}" toolboxitemid="looks" colour="${
        colors.colourPrimary
    }" secondaryColour="${colors.colourTertiary}" ${categoryIconAttribute('looks', colors.colourPrimary)}>
        ${isStage ? '' : `
        <block type="looks_sayforsecs">
            <value name="MESSAGE">
                <shadow type="text">
                    <field name="TEXT">${hello}</field>
                </shadow>
            </value>
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">2</field>
                </shadow>
            </value>
        </block>
        <block type="looks_say">
            <value name="MESSAGE">
                <shadow type="text">
                    <field name="TEXT">${hello}</field>
                </shadow>
            </value>
        </block>
        <block type="looks_thinkforsecs">
            <value name="MESSAGE">
                <shadow type="text">
                    <field name="TEXT">${hmm}</field>
                </shadow>
            </value>
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">2</field>
                </shadow>
            </value>
        </block>
        <block type="looks_think">
            <value name="MESSAGE">
                <shadow type="text">
                    <field name="TEXT">${hmm}</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        `}
        ${isStage ? `
            <block type="looks_switchbackdropto">
                <value name="BACKDROP">
                    <shadow type="looks_backdrops">
                        <field name="BACKDROP">${backdropName}</field>
                    </shadow>
                </value>
            </block>
            <block type="looks_switchbackdroptoandwait">
                <value name="BACKDROP">
                    <shadow type="looks_backdrops">
                        <field name="BACKDROP">${backdropName}</field>
                    </shadow>
                </value>
            </block>
            <block type="looks_nextbackdrop"/>
        ` : `
            <block id="${targetId}_switchcostumeto" type="looks_switchcostumeto">
                <value name="COSTUME">
                    <shadow type="looks_costume">
                        <field name="COSTUME">${costumeName}</field>
                    </shadow>
                </value>
            </block>
            <block type="looks_nextcostume"/>
            <block type="looks_switchbackdropto">
                <value name="BACKDROP">
                    <shadow type="looks_backdrops">
                        <field name="BACKDROP">${backdropName}</field>
                    </shadow>
                </value>
            </block>
            <block type="looks_nextbackdrop"/>
            ${blockSeparator}
            <block type="looks_changesizeby">
                <value name="CHANGE">
                    <shadow type="math_number">
                        <field name="NUM">10</field>
                    </shadow>
                </value>
            </block>
            <block type="looks_setsizeto">
                <value name="SIZE">
                    <shadow type="math_number">
                        <field name="NUM">100</field>
                    </shadow>
                </value>
            </block>
        `}
        ${blockSeparator}
        <block type="looks_changeeffectby">
            <value name="CHANGE">
                <shadow type="math_number">
                    <field name="NUM">25</field>
                </shadow>
            </value>
        </block>
        <block type="looks_seteffectto">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="looks_cleargraphiceffects"/>
        ${blockSeparator}
        ${isStage ? '' : `
            <block type="looks_show"/>
            <block type="looks_hide"/>
        ${blockSeparator}
            <block type="looks_gotofrontback"/>
            <block type="looks_goforwardbackwardlayers">
                <value name="NUM">
                    <shadow type="math_integer">
                        <field name="NUM">1</field>
                    </shadow>
                </value>
            </block>
        `}
        ${isStage ? `
            <block id="backdropnumbername" type="looks_backdropnumbername"/>
        ` : `
            <block id="${targetId}_costumenumbername" type="looks_costumenumbername"/>
            <block id="backdropnumbername" type="looks_backdropnumbername"/>
            <block id="${targetId}_size" type="looks_size"/>
        `}
        ${categorySeparator}
    </category>
    `;
};

const sound = function (isInitialSetup, isStage, targetId, soundName, colors) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category name="${ScratchBlocks.ScratchMsgs.translate(
        'CATEGORY_SOUND',
        'Sound'
    )}" toolboxitemid="sound" colour="${
        colors.colourPrimary
    }" secondaryColour="${colors.colourTertiary}" ${categoryIconAttribute('sound', colors.colourPrimary)}>
        <block id="${targetId}_sound_playuntildone" type="sound_playuntildone">
            <value name="SOUND_MENU">
                <shadow type="sound_sounds_menu">
                    <field name="SOUND_MENU">${soundName}</field>
                </shadow>
            </value>
        </block>
        <block id="${targetId}_sound_play" type="sound_play">
            <value name="SOUND_MENU">
                <shadow type="sound_sounds_menu">
                    <field name="SOUND_MENU">${soundName}</field>
                </shadow>
            </value>
        </block>
        <block type="sound_stopallsounds"/>
        ${blockSeparator}
        <block type="sound_changeeffectby">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="sound_seteffectto">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">100</field>
                </shadow>
            </value>
        </block>
        <block type="sound_cleareffects"/>
        ${blockSeparator}
        <block type="sound_changevolumeby">
            <value name="VOLUME">
                <shadow type="math_number">
                    <field name="NUM">-10</field>
                </shadow>
            </value>
        </block>
        <block type="sound_setvolumeto">
            <value name="VOLUME">
                <shadow type="math_number">
                    <field name="NUM">100</field>
                </shadow>
            </value>
        </block>
        <block id="${targetId}_volume" type="sound_volume"/>
        ${categorySeparator}
    </category>
    `;
};

const events = function (isInitialSetup, isStage, targetId, colors) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category name="${ScratchBlocks.ScratchMsgs.translate(
        'CATEGORY_EVENTS',
        'Events'
    )}" toolboxitemid="events" colour="${
        colors.colourPrimary
    }" secondaryColour="${colors.colourTertiary}" ${categoryIconAttribute('events', colors.colourPrimary)}>
        <block type="event_whenflagclicked"/>
        <block type="event_whenkeypressed">
        </block>
        ${isStage ? `
            <block type="event_whenstageclicked"/>
        ` : `
            <block type="event_whenthisspriteclicked"/>
        `}
        <block type="event_whenbackdropswitchesto">
        </block>
        ${blockSeparator}
        <block type="event_whengreaterthan">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="event_whenbroadcastreceived">
        </block>
        <block type="event_broadcast">
            <value name="BROADCAST_INPUT">
                <shadow type="event_broadcast_menu"></shadow>
            </value>
        </block>
        <block type="event_broadcastandwait">
            <value name="BROADCAST_INPUT">
              <shadow type="event_broadcast_menu"></shadow>
            </value>
        </block>
        ${categorySeparator}
    </category>
    `;
};

const control = function (isInitialSetup, isStage, targetId, colors) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category
        name="${ScratchBlocks.ScratchMsgs.translate(
            'CATEGORY_CONTROL',
            'Control'
        )}"
        toolboxitemid="control"
        colour="${colors.colourPrimary}"
        secondaryColour="${colors.colourTertiary}"
        ${categoryIconAttribute('control', colors.colourPrimary)}>
        <block type="control_wait">
            <value name="DURATION">
                <shadow type="math_positive_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="control_repeat">
            <value name="TIMES">
                <shadow type="math_whole_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block id="forever" type="control_forever"/>
        ${blockSeparator}
        <block type="control_if"/>
        <block type="control_if_else"/>
        <block id="wait_until" type="control_wait_until"/>
        <block id="repeat_until" type="control_repeat_until"/>
        ${blockSeparator}
        <block type="control_stop"/>
        ${blockSeparator}
        ${isStage ? `
            <block type="control_create_clone_of">
                <value name="CLONE_OPTION">
                    <shadow type="control_create_clone_of_menu"/>
                </value>
            </block>
        ` : `
            <block type="control_start_as_clone"/>
            <block type="control_create_clone_of">
                <value name="CLONE_OPTION">
                    <shadow type="control_create_clone_of_menu"/>
                </value>
            </block>
            <block type="control_delete_this_clone"/>
        `}
        ${categorySeparator}
    </category>
    `;
};

const sensing = function (isInitialSetup, isStage, targetId, colors) {
    const name = ScratchBlocks.ScratchMsgs.translate('SENSING_ASK_TEXT', 'What\'s your name?');
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category
        name="${ScratchBlocks.ScratchMsgs.translate(
            'CATEGORY_SENSING',
            'Sensing'
        )}"
        toolboxitemid="sensing"
        colour="${colors.colourPrimary}"
        secondaryColour="${colors.colourTertiary}"
        ${categoryIconAttribute('sensing', colors.colourPrimary)}>
        ${isStage ? '' : `
            <block type="sensing_touchingobject">
                <value name="TOUCHINGOBJECTMENU">
                    <shadow type="sensing_touchingobjectmenu"/>
                </value>
            </block>
            <block type="sensing_touchingcolor">
                <value name="COLOR">
                    <shadow type="colour_picker"/>
                </value>
            </block>
            <block type="sensing_coloristouchingcolor">
                <value name="COLOR">
                    <shadow type="colour_picker"/>
                </value>
                <value name="COLOR2">
                    <shadow type="colour_picker"/>
                </value>
            </block>
            <block type="sensing_distanceto">
                <value name="DISTANCETOMENU">
                    <shadow type="sensing_distancetomenu"/>
                </value>
            </block>
            ${blockSeparator}
        `}
        ${isInitialSetup ? '' : `
            <block id="askandwait" type="sensing_askandwait">
                <value name="QUESTION">
                    <shadow type="text">
                        <field name="TEXT">${name}</field>
                    </shadow>
                </value>
            </block>
        `}
        <block id="answer" type="sensing_answer"/>
        ${blockSeparator}
        <block type="sensing_keypressed">
            <value name="KEY_OPTION">
                <shadow type="sensing_keyoptions"/>
            </value>
        </block>
        <block type="sensing_mousedown"/>
        <block type="sensing_mousex"/>
        <block type="sensing_mousey"/>
        ${isStage ? '' : `
            ${blockSeparator}
            '<block type="sensing_setdragmode" id="sensing_setdragmode"></block>'+
            ${blockSeparator}
        `}
        ${blockSeparator}
        <block id="loudness" type="sensing_loudness"/>
        ${blockSeparator}
        <block id="timer" type="sensing_timer"/>
        <block type="sensing_resettimer"/>
        ${blockSeparator}
        <block id="of" type="sensing_of">
            <value name="OBJECT">
                <shadow id="sensing_of_object_menu" type="sensing_of_object_menu"/>
            </value>
        </block>
        ${blockSeparator}
        <block id="current" type="sensing_current"/>
        <block type="sensing_dayssince2000"/>
        ${blockSeparator}
        <block id="online" type="sensing_online" />
        <block type="sensing_username"/>
        ${categorySeparator}
    </category>
    `;
};

const operators = function (isInitialSetup, isStage, targetId, colors) {
    const apple = ScratchBlocks.ScratchMsgs.translate('OPERATORS_JOIN_APPLE', 'apple');
    const banana = ScratchBlocks.ScratchMsgs.translate('OPERATORS_JOIN_BANANA', 'banana');
    const letter = ScratchBlocks.ScratchMsgs.translate('OPERATORS_LETTEROF_APPLE', 'a');
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category
        name="${ScratchBlocks.ScratchMsgs.translate(
            'CATEGORY_OPERATORS',
            'Operators'
        )}"
        toolboxitemid="operators"
        colour="${colors.colourPrimary}"
        secondaryColour="${colors.colourTertiary}"
        ${categoryIconAttribute('operators', colors.colourPrimary)}>
        <block type="operator_add">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_subtract">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_multiply">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_divide">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_random">
            <value name="FROM">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="TO">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_gt">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>
        <block type="operator_lt">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>
        <block type="operator_equals">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_and"/>
        <block type="operator_or"/>
        <block type="operator_not"/>
        ${blockSeparator}
        ${isInitialSetup ? '' : `
            <block type="operator_join">
                <value name="STRING1">
                    <shadow type="text">
                        <field name="TEXT">${apple} </field>
                    </shadow>
                </value>
                <value name="STRING2">
                    <shadow type="text">
                        <field name="TEXT">${banana}</field>
                    </shadow>
                </value>
            </block>
            <block type="operator_letter_of">
                <value name="LETTER">
                    <shadow type="math_whole_number">
                        <field name="NUM">1</field>
                    </shadow>
                </value>
                <value name="STRING">
                    <shadow type="text">
                        <field name="TEXT">${apple}</field>
                    </shadow>
                </value>
            </block>
            <block type="operator_length">
                <value name="STRING">
                    <shadow type="text">
                        <field name="TEXT">${apple}</field>
                    </shadow>
                </value>
            </block>
            <block type="operator_contains" id="operator_contains">
              <value name="STRING1">
                <shadow type="text">
                  <field name="TEXT">${apple}</field>
                </shadow>
              </value>
              <value name="STRING2">
                <shadow type="text">
                  <field name="TEXT">${letter}</field>
                </shadow>
              </value>
            </block>
        `}
        ${blockSeparator}
        <block type="operator_mod">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_round">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_mathop">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        ${categorySeparator}
    </category>
    `;
};

const variables = function (isInitialSetup, isStage, targetId, colors) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category
        name="${ScratchBlocks.ScratchMsgs.translate(
            'CATEGORY_VARIABLES',
            'Variables'
        )}"
        toolboxitemid="variables"
        colour="${colors.colourPrimary}"
        secondaryColour="${colors.colourTertiary}"
        ${categoryIconAttribute('variables', colors.colourPrimary)}
        custom="VARIABLE">
    </category>
    `;
};

const myBlocks = function (isInitialSetup, isStage, targetId, colors) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    return `
    <category
        name="${ScratchBlocks.ScratchMsgs.translate(
            'CATEGORY_MYBLOCKS',
            'My Blocks'
        )}"
        toolboxitemid="myBlocks"
        colour="${colors.colourPrimary}"
        secondaryColour="${colors.colourTertiary}"
        ${categoryIconAttribute('myBlocks', colors.colourPrimary)}
        custom="PROCEDURE">
    </category>
    `;
};

const makeTeachingBlocksXML = function (blocks) {
    return blocks.map(block => {
        const values = (block.inputs || []).map(input => `
            <value name="${input.name}">
                <shadow type="${input.type}">
                    <field name="${input.type === 'text' ? 'TEXT' : 'NUM'}">${xmlEscape(input.defaultValue)}</field>
                </shadow>
            </value>
        `).join('');
        return `
        <block type="${block.opcode}">
            ${values}
        </block>`;
    }).join('\n');
};

const starter = function (isStage, colors) {
    if (isStage) return '';
    const starterBlocksXML = makeTeachingBlocksXML(STARTER_BLOCKS);
    return `
    <category
        name="${ScratchBlocks.ScratchMsgs.translate(
            'CATEGORY_STARTER',
            STARTER_BLOCK_CATEGORY_NAME
        )}"
        toolboxitemid="${STARTER_BLOCK_CATEGORY_ID}"
        colour="${colors.colourPrimary}"
        secondaryColour="${colors.colourTertiary}"
        ${categoryIconAttribute('starter', colors.colourPrimary)}>
        ${starterBlocksXML}
        ${categorySeparator}
    </category>
    `;
};

const specialised = function (isStage, colors) {
    if (isStage) return '';
    const specialisedBlocksXML = makeTeachingBlocksXML(SPECIALISED_BLOCKS);
    return `
    <category
        name="${ScratchBlocks.ScratchMsgs.translate(
            'CATEGORY_SPECIALISED',
            SPECIALISED_BLOCK_CATEGORY_NAME
        )}"
        toolboxitemid="${SPECIALISED_BLOCK_CATEGORY_ID}"
        colour="${colors.colourPrimary}"
        secondaryColour="${colors.colourTertiary}"
        ${categoryIconAttribute('specialised', colors.colourPrimary)}>
        ${specialisedBlocksXML}
        ${categorySeparator}
    </category>
    `;
};


const xmlOpen = '<xml style="display: none">';
const xmlClose = '</xml>';

/**
 * @param {!boolean} isInitialSetup - Whether the toolbox is for initial setup. If the mode is "initial setup",
 * blocks with localized default parameters (e.g. ask and wait) should not be loaded. (LLK/scratch-gui#5445)
 * @param {?boolean} isStage - Whether the toolbox is for a stage-type target. This is always set to true
 * when isInitialSetup is true.
 * @param {?string} targetId - The current editing target
 * @param {?Array.<object>} categoriesXML - optional array of `{id,xml}` for categories. This can include both core
 * and other extensions: core extensions will be placed in the normal Scratch order; others will go at the bottom.
 * @property {string} id - the extension / category ID.
 * @property {string} xml - the `<category>...</category>` XML for this extension / category.
 * @param {?string} costumeName - The name of the default selected costume dropdown.
 * @param {?string} backdropName - The name of the default selected backdrop dropdown.
 * @param {?string} soundName -  The name of the default selected sound dropdown.
 * @param {?object} colors - The colors for the color mode.
 * @returns {string} - a ScratchBlocks-style XML document for the contents of the toolbox.
 */
const makeToolboxXML = function (isInitialSetup, isStage = true, targetId, categoriesXML = [],
    costumeName = '', backdropName = '', soundName = '', colors = defaultColors) {
    isStage = isInitialSetup || isStage;
    const gap = [categorySeparator];

    costumeName = xmlEscape(costumeName);
    backdropName = xmlEscape(backdropName);
    soundName = xmlEscape(soundName);

    categoriesXML = categoriesXML.slice();
    const moveCategory = categoryId => {
        const index = categoriesXML.findIndex(categoryInfo => categoryInfo.id === categoryId);
        if (index >= 0) {
            // remove the category from categoriesXML and return its XML
            const [categoryInfo] = categoriesXML.splice(index, 1);
            return categoryInfo.xml;
        }
        // return `undefined`
    };
    const motionXML = moveCategory('motion') || motion(isInitialSetup, isStage, targetId, colors.motion);
    const looksXML = moveCategory('looks') ||
        looks(isInitialSetup, isStage, targetId, costumeName, backdropName, colors.looks);
    const soundXML = moveCategory('sound') || sound(isInitialSetup, isStage, targetId, soundName, colors.sounds);
    const eventsXML = moveCategory('event') || events(isInitialSetup, isStage, targetId, colors.event);
    const controlXML = moveCategory('control') || control(isInitialSetup, isStage, targetId, colors.control);
    const sensingXML = moveCategory('sensing') || sensing(isInitialSetup, isStage, targetId, colors.sensing);
    const operatorsXML = moveCategory('operators') || operators(isInitialSetup, isStage, targetId, colors.operators);
    const variablesXML = moveCategory('data') || variables(isInitialSetup, isStage, targetId, colors.data);
    const myBlocksXML = moveCategory('procedures') || myBlocks(isInitialSetup, isStage, targetId, colors.more);
    const starterXML = starter(isStage, colors.more);
    const specialisedXML = specialised(isStage, colors.more);

    const everything = [
        xmlOpen,
        motionXML, gap,
        looksXML, gap,
        soundXML, gap,
        eventsXML, gap,
        controlXML, gap,
        sensingXML, gap,
        operatorsXML, gap,
        variablesXML, gap,
        myBlocksXML, gap,
        starterXML, gap,
        specialisedXML
    ];

    for (const extensionCategory of categoriesXML) {
        everything.push(gap, extensionCategory.xml);
    }

    everything.push(xmlClose);
    return everything.join('\n');
};

export default makeToolboxXML;
