var express = require('express');
var app = express();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var mdAutentificacion = require('../middlewares/autentificacion');


var Usuario = require('../models/usuario');

// ===========================================================================
// Obtener todos los usuarios
// ===========================================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            Usuario.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    total: conteo
                });
            });



        });


});

// ===========================================================================
// Final de Obtener todos los usuarios
// ===========================================================================

// ===========================================================================
// Actualizar usuario
// ===========================================================================

app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario con ID: ' + id + ' no encontrado',
                errors: { message: 'No existe usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = '---';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

// ===========================================================================
// Final de Actualizar usuario
// ===========================================================================

// ===========================================================================
// Crear un nuevo usuario
// ===========================================================================

app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    var body = req.body;

    usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });


});

// ===========================================================================
// Final de Crear un nuevo usuario
// ===========================================================================

// ===========================================================================
// Borrar usuario por id
// ===========================================================================

app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Usuario con ID: ' + id + ' no encontrado',
                errors: { message: 'No existe usuario con ese ID' }
            });
        }


        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});



// ===========================================================================
// Final de Borrar usuario por id
// ===========================================================================
module.exports = app;