const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

function generateBinaryStrings(n) {
    const result = [];
    for (let i = 0; i < Math.pow(2, n); i++) {
        let binary = Number(i).toString(2);
        while (binary.length < n) {
            binary = "0" + binary;
        }
        result.push(binary);
    }
    return result;
}

function countOnes(binaryString) {
    return binaryString.split('').reduce((count, digit) => count + (digit === '1' ? 1 : 0), 0);
}

app.post('/auto', (req, res) => {
    const n = req.body.n;
    const binaryStrings = generateBinaryStrings(n);
    const counts = binaryStrings.map(countOnes);
    fs.writeFileSync('output.txt', JSON.stringify({ n, binaryStrings, counts }), (err) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'An error occurred while writing to output.txt' });
            return;
        }
        res.json({ n, binaryStrings, counts });
    });
});

module.exports = app;

app.post('/manual', (req, res) => {
    const n = req.body.n;
    const binaryStrings = generateBinaryStrings(n);
    const counts = binaryStrings.map(countOnes);
    fs.writeFileSync('output.txt', JSON.stringify({ n, binaryStrings, counts }), (err) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'An error occurred while writing to output.txt' });
            return;
        }
        res.json({ n, binaryStrings, counts });
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));