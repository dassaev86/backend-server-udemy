var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');
var mdAutentificacion = require('../middlewares/autentificacion');

//-------- Obtener hospitales-----------------------------------------------------------

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(404).json({
                    ok: false,
                    message: 'Hospitales no encontrados',
                    errores: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });
        });
});



//--------Fin Obtener usuarios---------------------------------------------------------

//-------- Modificar hospitales-----------------------------------------------------------

app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al buscar hospital',
                errores: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'Hospitale con id: ' + id + ' no encontrado',
                errores: { message: 'No existe usuario con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el hospital',
                    errores: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalActualizado
            });
        });
    });
});

//-------- Fin Modificar hospitales-----------------------------------------------------------

//-------- Crear hospitales-----------------------------------------------------------

app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    var body = req.body;
    var user = req.usuario;

    var hospital = new Hospital({
        nombre: body.nombre
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al guardar hospital',
                errores: err
            });
        }

        hospitalGuardado.usuario = req.usuario._id;

        hospital = hospitalGuardado;

        hospital.save((err, hospitalGuardadoConID) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al guardar hospital',
                    errores: err
                });
            }

            res.status(201).json({
                ok: true,
                hospital: hospitalGuardadoConID,

            });

        });




    });

});


//-------- Fin Crear hospitales-----------------------------------------------------------

//-------- Borrar hospitales-----------------------------------------------------------

app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al buscar hospital',
                errores: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'Hospital con id: ' + id + ' no encontrado',
                errores: { message: 'No existe usuario con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

//-------- Fin Borrar hospitales-----------------------------------------------------------

module.exports = app;