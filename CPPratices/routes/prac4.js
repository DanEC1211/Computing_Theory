const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

class PDA {
    constructor() {
        this.stack = [];
        this.state = 'q0';
    }

    reset() {
        this.stack = ['Z'];  // Z es el símbolo inicial de la pila
        this.state = 'q0';
    }

    processInput(inputString) {
        for (let char of inputString) {
            if (this.state === 'q0') {
                if (char === '0') {
                    this.stack.push('0');
                } else if (char === '1' && this.stack[this.stack.length - 1] === '0') {
                    this.stack.pop();
                    this.state = 'q1';
                } else {
                    return false;
                }
            } else if (this.state === 'q1') {
                if (char === '1' && this.stack[this.stack.length - 1] === '0') {
                    this.stack.pop();
                } else {
                    return false;
                }
            }
        }

        return this.state === 'q1' && this.stack.length === 1 && this.stack[0] === 'Z';
    }
}

app.post('/PDA', (req, res) => {
    const { cadena } = req.body;
    const pda = new PDA();
    pda.reset();
    const isAccepted = pda.processInput(cadena);

    if (isAccepted) {
        res.send("Cadena aceptada.");
    } else {
        res.send("Cadena rechazada.");
    }
});



module.exports = app;
