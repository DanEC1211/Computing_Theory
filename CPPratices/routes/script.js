const express = require('express');
const fs = require('fs');
const path = require('path');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const app = express();
const readFile = util.promisify(fs.readFile);
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
    const batchSize = 10000; // Tamaño del lote
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
        batchIndex++;
    }

    res.json({ n, totalBatches: batchIndex }); // Devuelve el total de lotes
});


app.get('/batch/:index', async (req, res) => {
    const index = req.params.index;
    try {
        const data = await readFile(path.join('calcs', `output_${index}.txt`), 'utf-8');
        if (data) {
            res.json(JSON.parse(data));
        } else {
            res.status(404).send('Batch file is empty.');
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('An error occurred while reading the batch file.');
    }
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

app.get('/download', async (req, res) => {
    const maxBatchIndex = req.query.maxBatchIndex; // Número máximo de lotes
    const n = req.query.n; // Obtiene n desde los parámetros de consulta
    const files = fs.readdirSync('./calcs');
    const sortedFiles = files.sort((a, b) => {
        const batchNumberA = parseInt(a.split('_')[1]); // Extrae el número de lote del nombre del archivo
        const batchNumberB = parseInt(b.split('_')[1]);
        return batchNumberA - batchNumberB;
    });

    const allBatchesFilePath = path.join(__dirname, '../calcs', 'Universo.txt');
    fs.writeFileSync(allBatchesFilePath, `Σ^(n=${n})[0,1]={ ϵ,`); // Inicia la escritura del archivo

    for (const file of sortedFiles) {
        const batchNumber = parseInt(file.split('_')[1]);
        if (batchNumber <= maxBatchIndex) { // Solo procesa los archivos hasta el número máximo de lotes
            const filePath = path.join(__dirname, '../calcs', file);
            const fileContent = await fs.promises.readFile(filePath, 'utf8');
            const batchData = JSON.parse(fileContent);
            const trimmedBinaryStrings = batchData.binaryStrings.map(binaryString => parseInt(binaryString, 2).toString(2)); // Elimina los ceros a la izquierda
            fs.appendFileSync(allBatchesFilePath, trimmedBinaryStrings.join(',') + ','); // Añade el contenido del lote al archivo
        }
    }

    fs.appendFileSync(allBatchesFilePath, '}'); // Cierra la notación de conjunto

    res.redirect(`/calcs/Universo.txt`);
});

app.get('/calcs/Universo.txt', (req, res) => {
    const filePath = path.join(__dirname, '../calcs', 'Universo.txt');
    res.download(filePath, 'Universo.txt', function(err){
        if (err) {
            console.log(err);
            res.status(500).send('Error al descargar el archivo.');
        } else {
            console.log('Archivo descargado correctamente');
        }
    });
});

module.exports = app;