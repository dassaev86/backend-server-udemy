var express = require('express');
var app = express();

var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');
var mdAutentificacion = require('../middlewares/autentificacion');

//-------- Obtener hospitales-----------------------------------------------------------

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(404).json({
                    ok: false,
                    message: 'Médicos no encontrados',
                    errores: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
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

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al buscar el médico',
                errores: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                message: 'Médico con id: ' + id + ' no encontrado',
                errores: { message: 'No existe médico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el médico',
                    errores: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoActualizado
            });
        });
    });
});

//-------- Fin Modificar hospitales-----------------------------------------------------------

//-------- Crear hospitales-----------------------------------------------------------

app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    var body = req.body;


    var medico = new Medico({
        nombre: body.nombre,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al guardar el médico',
                errores: err
            });
        }

        medicoGuardado.usuario = req.usuario._id;
        medico = medicoGuardado;

        medico.save((err, medicoGuardadoConID) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al guardar el médico',
                    errores: err
                });
            }

            res.status(201).json({
                ok: true,
                medico: medicoGuardadoConID,
                message: 'Médico guardado correctamente'
            });

        });



    });


});


//-------- Fin Crear hospitales-----------------------------------------------------------

//-------- Borrar hospitales-----------------------------------------------------------

app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al buscar el médico',
                errores: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'Médico con id: ' + id + ' no encontrado',
                errores: { message: 'No existe médico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            message: 'Este elemento ha sido eliminado correctamente'
        });
    });
});

//-------- Fin Borrar hospitales-----------------------------------------------------------

module.exports = app;