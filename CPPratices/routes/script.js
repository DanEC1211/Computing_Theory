const express = require('express');
const fs = require('fs');
const path = require('path');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const app = express();
app.use(express.json());

function* generateBinaryStrings(n) {
    for (let i = 0; i < Math.pow(2, n); i++) {
        let binary = Number(i).toString(2);
        while (binary.length < n) {
            binary = "0" + binary;
        }
        yield binary;
    }
}

function countOnes(binaryString) {
    return binaryString.split('').reduce((count, digit) => count + (digit === '1' ? 1 : 0), 0);
}

app.post('/calc', async (req, res) => {
    const n = req.body.n;
    const batchSize = 5000; // Tamaño del lote
    const binaryStrings = [];
    const counts = [];

    let batchIndex = 0;
    for (const binaryString of generateBinaryStrings(n)) {
        binaryStrings.push(binaryString);
        counts.push(countOnes(binaryString));

        // Si hemos alcanzado el tamaño del lote, escribe los resultados y vacía las matrices
        if (binaryStrings.length >= batchSize) {
            await writeBatchToFile(batchIndex, { n, binaryStrings, counts });
            binaryStrings.length = 0;
            counts.length = 0;
            batchIndex++;
        }
    }

    // Escribe cualquier dato restante que no haya alcanzado el tamaño del lote
    if (binaryStrings.length > 0) {
        await writeBatchToFile(batchIndex, { n, binaryStrings, counts });
    }

    res.json({ n, binaryStrings, counts });
});

async function writeBatchToFile(batchIndex, data) {
    const dir = 'calcs';
    
    // Crear el directorio si no existe
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    try {
        await writeFile(path.join(dir, `output_${batchIndex}.txt`), JSON.stringify(data));
    } catch (err) {
        console.error('Error:', err);
        throw new Error('An error occurred while writing to output.txt');
    }
}

app.get('/download', (req, res) => {
    const files = fs.readdirSync('calcs');
    const lastFile = files.sort((a, b) => fs.statSync('calcs/' + b).mtime - fs.statSync('calcs/' + a).mtime)[0];
    res.download(`../calcs/${lastFile}`); // Enviar el último archivo creado
});

module.exports = app;