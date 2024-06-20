const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); 
const app = express();
const path = require('path');
app.use(bodyParser.json());

class PDA {
    constructor() {
        this.stack = [];
        this.state = 'q0';
        this.snapshots = []; 
    }

    reset() {
        this.stack = ['Z']; 
        this.state = 'q0';
        this.snapshots = []; 
        this.snapshots.push({state: this.state, input: '', stack: this.stack.slice()});
    }

    processInput(inputString) {
        for (let char of inputString) {
            if (this.state === 'q0') {
                if (char === '0') {
                    this.stack.push('0');
                    this.snapshots.push({state: this.state, input: char, stack: this.stack.slice()});
                } else if (char === '1' && this.stack[this.stack.length - 1] === '0') {
                    this.stack.pop();
                    this.state = 'q1';
                    this.snapshots.push({state: this.state, input: char, stack: this.stack.slice()});
                } else {
                    return false;
                }
            } else if (this.state === 'q1') {
                if (char === '1' && this.stack[this.stack.length - 1] === '0') {
                    this.stack.pop();
                    this.snapshots.push({state: this.state, input: char, stack: this.stack.slice()});
                } else {
                    return false;
                }
            }
        }

        if (this.state === 'q1' && this.stack.length === 1 && this.stack[0] === 'Z') {
            this.snapshots.push({state: 'qf', input: 'epsilon', stack: this.stack.slice()});
        }

        return this.state === 'q1' && this.stack.length === 1 && this.stack[0] === 'Z';
    }
}

app.post('/PDA', (req, res) => {
    try {
        const { cadena } = req.body;
        if (typeof cadena !== 'string') {
            return res.status(400).json({ message: "La entrada debe ser una cadena." });
        }

        const pda = new PDA();
        pda.reset();
        const isAccepted = pda.processInput(cadena);

        const snapshotsDir = path.join(__dirname, '../snapshots');
        if (!fs.existsSync(snapshotsDir)) {
            fs.mkdirSync(snapshotsDir, { recursive: true });
        }

        const filePath = path.join(snapshotsDir, 'snapshots.txt');
        const formattedSnapshots = pda.snapshots.map(snapshot => `(${snapshot.state}, ${snapshot.input}, [${snapshot.stack.join(', ')}])`).join('\n');
        fs.writeFileSync(filePath, formattedSnapshots);

        if (isAccepted) {
            res.json({
                message: "Cadena aceptada.",
                snapshots: pda.snapshots
            });
        } else {
            res.json({
                message: "Cadena rechazada.",
                snapshots: pda.snapshots
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al procesar la solicitud: " + error.message });
    }
});

app.get('/downloadPDA', (req, res) => {
    const filePath = path.join(__dirname, '../snapshots', 'snapshots.txt');
    res.download(filePath, 'snapshots.txt', (err) => {
        if (err) {
            res.status(500).send({
                message: "No se pudo descargar el archivo. " + err
            });
        }
    });
});

module.exports = app;