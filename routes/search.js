var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//======== Búsqueda por Colección ==================================================

app.get('/coleccion/:tabla/:search', (req, res) => {
    var search = req.params.search;
    var tabla = req.params.tabla;
    var regexp = new RegExp(search, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(search, regexp);
            break;

        case 'hospitales':
            promesa = buscarHospitales(search, regexp);
            break;

        case 'medicos':
            promesa = buscarMedicos(search, regexp);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda disponibles son: usuarios, hospitales y medicos',
                error: { message: 'Colección no válida' }
            });

    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});


//======== Fin Búsqueda por Colección ==================================================


//======== Búsqueda General ==================================================
app.get('/todo/:search', (req, res, next) => {

    var search = req.params.search;
    var regexp = new RegExp(search, 'i');

    Promise.all([buscarHospitales(search, regexp),
            buscarMedicos(search, regexp),
            buscarUsuarios(search, regexp)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});

//======== Fin Búsqueda General ==================================================

function buscarHospitales(search, regexp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regexp })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales' + err);
                } else {
                    resolve(hospitales);
                }
            });
    });


}


function buscarMedicos(search, regexp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regexp })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos' + err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(search, regexp) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ nombre: regexp }, { email: regexp }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            })

    });
}

module.exports = app;