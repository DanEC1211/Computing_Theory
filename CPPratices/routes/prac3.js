const express = require('express');
const axios = require('axios');
const app = express();


const dfa = {
    initialState: 'q0',
    acceptingStates: ['q7', 'q18', 'q24', 'q30', 'q36', 'q43'],
    transitions: {
        'q0': {'e': 'q1_q8', 'r': 'q19_q25', 'c': 'q31', 'm': 'q37'},
        'q1_q8': {'s': 'q2_q9'},
        'q19_q25': {'e': 'q20', 'i': 'q26'},
        'q31': {'r': 'q32'},
        'q37': {'a': 'q38'},
        'q2_q9': {'c': 'q3', 't': 'q10'},
        'q20': {'n': 'q21'},
        'q26': {'f': 'q27'},
        'q32': {'i': 'q33'},
        'q38': {'t': 'q39'},
        'q3': {'u': 'q4'},
        'q10': {'u': 'q11'},
        'q21': {'c': 'q22'},
        'q27': {'l': 'q28'},
        'q33': {'m': 'q34'},
        'q39': {'a': 'q40'},
        'q4': {'e': 'q5'},
        'q11': {'d': 'q12'},
        'q22': {'o': 'q23'},
        'q28': {'e': 'q29'},
        'q34': {'e': 'q35'},
        'q40': {'n': 'q41'},
        'q5': {'l': 'q6'},
        'q12': {'i': 'q13'},
        'q23': {'r': 'q24'},
        'q29': {'s': 'q30'},
        'q35': {'n': 'q36'},
        'q41': {'z': 'q42'},
        'q6': {'a': 'q7'},
        'q13': {'a': 'q14'},
        'q14': {'n': 'q15'},
        'q15': {'t': 'q16'},
        'q16': {'e': 'q17'},
        'q17': {'s': 'q18'},
        'q42': {'a': 'q43'}
    }
};

async function fetchText(input) {
    if (input.startsWith('http')) {
        const response = await axios.get(input);
        const text = response.data;
        return text.split(/\s+/).join(' ');
    }
    return input;
}

function runDFA(text) {
    const positions = [];
    const transitions = dfa.transitions;
    let state = dfa.initialState;
    let log = "";
    let wordStart = -1;
    let currentWord = '';
    let i = 0;

    for (const char of text) {
        const lowerChar = char.toLowerCase();
        log += `Read '${lowerChar}' in state '${state}'\n`;

        let nextState = null;
        if (transitions[state] && transitions[state][lowerChar]) {
            nextState = transitions[state][lowerChar];
        } else if (state.includes('_')) {
            const states = state.split('_');
            for (const s of states) {
                if (transitions[s] && transitions[s][lowerChar]) {
                    nextState = transitions[s][lowerChar];
                    break;
                }
            }
        }
        
        if (nextState) {
            if (wordStart === -1) wordStart = i;
            currentWord += lowerChar;
            state = nextState;
            log += `Transition to '${state}'\n`;
        } else {
            if (dfa.acceptingStates.includes(state)) {
                const existingPosition = positions.find(pos => pos.word === currentWord && pos.position === wordStart);
                if (!existingPosition) {
                    positions.push({ word: currentWord, position: wordStart });
                    log += `Accepted word '${currentWord}' at position ${wordStart}\n`;
                }
            }
            state = dfa.initialState;
            currentWord = '';
            wordStart = -1;
        }
        i++;
    }
    if (dfa.acceptingStates.includes(state)) {
        const existingPosition = positions.find(pos => pos.word === currentWord && pos.position === wordStart);
        if (!existingPosition) {
            positions.push({ word: currentWord, position: wordStart });
            log += `Accepted word '${currentWord}' at position ${wordStart}\n`;
        }
    }

    const wordsFound = positions.map(pos => pos.word);
    const histogram = wordsFound.reduce((hist, word) => {
        hist[word] = (hist[word] || 0) + 1;
        return hist;
    }, {});

    return { positions, wordsFound, log, histogram };
}
app.post('/process-text', async (req, res) => {
    try {
        const input = req.body.text;
        const text = await fetchText(input);
        const result = runDFA(text);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

module.exports = app;