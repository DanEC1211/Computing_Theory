const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(bodyParser.json());

function BNFGenerator(maxDerivations = 1000) {
  this.rules = {
    'S': ['iCtSA'],
    'A': [';eS', '']
  };
  this.maxDerivations = maxDerivations;
  this.derivations = [];
  this.pseudocode = [];

  this.derive = function(symbol, currentStep = 0, countIfs = { current: 0 }, numIfs) {
    if (currentStep >= this.maxDerivations || countIfs.current >= numIfs) {
      return symbol;
    }

    if (!this.rules[symbol]) {
      return symbol;
    }

    const rule = this.rules[symbol][Math.floor(Math.random() * this.rules[symbol].length)];
    let derivation = '';
    for (const char of rule) {
      if (char === 'i' && countIfs.current < numIfs) {
        countIfs.current += 1; // Incrementar el contador de 'if's
      }
      derivation += this.derive(char, currentStep + 1, countIfs, numIfs);
    }

    this.derivations.push(`${symbol} -> ${rule}`);
    return derivation;
  };

  this.generate = function(numIfs) {
    let result = '';
    let countIfs = { current: 0 };

    while (countIfs.current < numIfs) {
      result += this.derive('S', 0, countIfs, numIfs);
    }

    this.generatePseudocode(result);
    return result;
  };

  this.generatePseudocode = function(derivedString) {
    let indent = 0;
    for (const char of derivedString) {
      if (char === 'i') {
        this.pseudocode.push('    '.repeat(indent) + 'if condition {');
        indent += 1;
      } else if (char === 'e') {
        indent -= 1;
        this.pseudocode.push('    '.repeat(indent) + '} else {');
        indent += 1;
      } else if (char === 'S' || char === 'A') {
        continue;
      } else if (char === ';') {
        this.pseudocode.push('    '.repeat(indent) + '// statement');
      } else if (char === 'C' || char === 't') {
        // Placeholder for condition and then
      }
    }
    while (indent > 0) {
      indent -= 1;
      this.pseudocode.push('    '.repeat(indent) + '}');
    }
  };

  this.saveToFile = function(derivationsFile = 'ifgen/derivations.txt', pseudocodeFile = 'ifgen/pseudocode.txt') {
    try {
      const dir = path.dirname(derivationsFile);
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(derivationsFile, this.derivations.join('\n'));
      fs.writeFileSync(pseudocodeFile, this.pseudocode.join('\n'));
    } catch (error) {
      console.error('Error al guardar los archivos:', error);
    }
  };
}

// Definir la ruta
app.post('/whatIf', (req, res) => {
  try {
    let numIfs = req.body.numIfs;
    numIfs = parseInt(numIfs);
    if (isNaN(numIfs) || numIfs < 0) {
        res.status(400).json({ error: 'Invalid number of ifs' });
        return;
    }

    const generator = new BNFGenerator();
    generator.generate(numIfs);
    generator.saveToFile(); 

    // Enviar el resultado como JSON
    res.json({
      derivations: generator.derivations,
      pseudocode: generator.pseudocode
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/download/derivations', (req, res) => {
  const filePath = path.join(__dirname, '../ifgen/derivations.txt');
  res.download(filePath); // Esto enviará el archivo para descargar
});

app.get('/download/pseudocode', (req, res) => {
  const filePath = path.join(__dirname, '../ifgen/pseudocode.txt');
  res.download(filePath); // Esto enviará el archivo para descargar
});

module.exports = app;