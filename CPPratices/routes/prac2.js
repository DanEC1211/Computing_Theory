const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(bodyParser.json());

var MatrizAdyacencia = [
    [null, 'W', null, null, 'W', 'B', null, null, null, null, null, null, null, null, null, null],
    ['B', null, 'B', null, 'W', 'B', 'W', null, null, null, null, null, null, null, null, null],
    [null, 'W', null, 'W', null, 'B', 'W', 'B', null, null, null, null, null, null, null, null],
    [null, null, 'B', null, null, null, 'W', 'B', null, null, null, null, null, null, null, null],
    ['B', 'W', null, null, null, 'B', null, null, 'B', 'W', null, null, null, null, null, null],
    ['B', 'W', 'B', null, 'W', null, 'W', null, 'B', 'W', 'B', null, null, null, null, null],
    [null, 'W', 'B', 'W', null, 'B', null, 'B', null, 'W', 'B', 'W', null, null, null, null],
    [null, null, 'B', 'W', null, null, 'W', null, null, null, 'B', 'W', null, null, null, null],
    [null, null, null, null, 'W', 'B', null, null, null, 'W', null, null, 'W', 'B', null, null],
    [null, null, null, null, 'W', 'B', 'W', null, 'B', null, 'B', null, 'W', 'B', 'W', null],
    [null, null, null, null, null, 'B', 'W', 'B', null, 'W', null, 'W', null, 'B', 'W', 'B'],
    [null, null, null, null, null, null, 'W', 'B', null, null, 'B', null, null, null, 'W', 'B'],
    [null, null, null, null, null, null, null, null, 'B', 'W', null, null, null, 'B', null, null],
    [null, null, null, null, null, null, null, null, 'B', 'W', 'B', null, 'W', null, 'W', null],
    [null, null, null, null, null, null, null, null, null, 'W', 'B', 'W', null, 'B', null, 'B'],
    [null, null, null, null, null, null, null, null, null, null, 'B', 'W', null, null, 'W', null]
    ];

function movimientosValidos(posicion, restriccion, MatrizAdyacencia) {
    const movimientos = [];

    for (let i = 0; i < MatrizAdyacencia[posicion].length; i++) {
        if (MatrizAdyacencia[posicion][i] === restriccion) {
            movimientos.push(i + 1); // Incrementamos en 1
        }
    }

    return movimientos;
}

function generarArbol(numeroDeJugador, posicion, restricciones, MatrizAdyacencia) {
    let tamanoDeLote = 8000;
    let ultimoLote = 0;
    let loteActual = [];
    let i = 0;

    function dfs(posActual, restricciones, arbol) {
        if (restricciones.length === 0) {
            return;
        }

        const restriccion = restricciones.charAt(0);
        restricciones = restricciones.slice(1);

        const movimientos = movimientosValidos(posActual - 1, restriccion, MatrizAdyacencia); 

        for (const movimiento of movimientos) {
            const clave = `${posActual}-${movimiento}`;
            arbol[clave] = {};
            dfs(movimiento, restricciones, arbol[clave]);
            loteActual.push(arbol);

            if (loteActual.length === tamanoDeLote) {
                fs.writeFileSync(path.join(__dirname, '../gotrees', `jugador${numeroDeJugador}_lote_${++i}.json`), JSON.stringify(loteActual));
                ultimoLote = i;
                loteActual = [];
            }
        }
    }

    const arbol = {};
    dfs(posicion, restricciones, arbol);

    // Escribir el último lote si no está vacío
    if (loteActual.length > 0) {
        fs.writeFileSync(path.join(__dirname, '../gotrees', `jugador${numeroDeJugador}_lote_${++i}.json`), JSON.stringify(loteActual));
        ultimoLote = i;
    }

    return ultimoLote;
}

function obtenerProfundidad(objeto) {
    let nivel = 0;
    for (let clave in objeto) {
        if (objeto.hasOwnProperty(clave)) {
            let subnivel = obtenerProfundidad(objeto[clave]);
            if (subnivel > nivel) {
                nivel = subnivel;
            }
        }
    }
    return nivel + 1;
}

function obtenerRutas(objeto, ruta = [], rutas = []) {
    for (let clave in objeto) {
        if (objeto.hasOwnProperty(clave)) {
            let nuevaRuta = ruta.concat(clave);
            if (typeof objeto[clave] === 'object' && !Array.isArray(objeto[clave]) && objeto[clave] !== null) {
                obtenerRutas(objeto[clave], nuevaRuta, rutas);
            }
            rutas.push(nuevaRuta);
        }
    }

    // Encuentra la longitud de la ruta más larga
    let maxLongitud = Math.max(...rutas.map(ruta => ruta.length));

    // Filtra las rutas para solo devolver las de mayor longitud
    return rutas.filter(ruta => ruta.length === maxLongitud);
}
function pathSelected(numeroDeJugador, numeroDeLote, tryhard = true) {
    // Genera el nombre del archivo
    const fileName = `jugador${numeroDeJugador}_lote_${numeroDeLote}.json`;

    // Asegúrate de que el lote seleccionado exista
    if (!fs.existsSync(path.join(__dirname, '../gotrees', fileName))) {
        return [];
    }

    const arbol = JSON.parse(fs.readFileSync(path.join(__dirname, '../gotrees', fileName)));
    const ultimaClavePrincipal = Object.keys(arbol).sort((a, b) => b - a)[0];
    const rutas = obtenerRutas(arbol[ultimaClavePrincipal]);

    let rutaSeleccionada;
    if (tryhard) {
        // Si el modo tryhard está activado, busca una ruta que contenga el número "13" para el jugador 1 y el "16" para el jugador 2
        const numeroBuscado = numeroDeJugador === 1 ? '16' : '13';
        rutaSeleccionada = rutas.find(ruta => ruta.includes(numeroBuscado));
        if (!rutaSeleccionada) {
            const randomIndex = Math.floor(Math.random() * rutas.length);
            rutaSeleccionada = rutas[randomIndex];
        }
    } else {
        // Si el modo tryhard está desactivado, selecciona una ruta al azar
        const randomIndex = Math.floor(Math.random() * rutas.length);
        rutaSeleccionada = rutas[randomIndex];
    }

    // Convierte la ruta seleccionada al formato deseado
    const rutaConvertida = rutaSeleccionada.flatMap(ruta => ruta.split('-')).map(Number);

    // Elimina los números duplicados consecutivos
    const rutaSinDuplicados = rutaConvertida.reduce((acc, num, i, arr) => {
        if (num !== arr[i - 1]) {
            acc.push(num);
        }
        return acc;
    }, []);

    return rutaSinDuplicados;
}

app.post('/go', (req, res) => {
    const cadena1 = req.body.StepsPlayer1;
    const cadena2 = req.body.StepsPlayer2;
    console.log(cadena1);
    console.log(cadena2);

    let firstPlayer1 = Math.floor(Math.random() * 100) % 2 === 0;

    const posPlayer1 = 1;
    const posPlayer2 = 4;

    const ultimoLotePlayer1 = generarArbol( 1, posPlayer1, cadena1, MatrizAdyacencia);
    console.log("Arbol del jugador 1 creado correctamente: ",ultimoLotePlayer1);
    const ultimoLotePlayer2 = generarArbol( 2, posPlayer2, cadena2, MatrizAdyacencia);
    console.log("Arbol del jugador 2 creado correctamente: ",ultimoLotePlayer2);

    const pathPlayer1 = pathSelected(1,ultimoLotePlayer1);
    console.log("Ruta del jugador 1: ",pathPlayer1);
    const pathPlayer2 = pathSelected(2,ultimoLotePlayer2);
    console.log("Ruta del jugador 2: ",pathPlayer2);

    res.send({
        firstPlayer1: firstPlayer1,
        pathPlayer1: pathPlayer1,
        pathPlayer2: pathPlayer2
    });
});



app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal!');
  });

module.exports = app;