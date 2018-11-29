var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

// default options
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de Colección

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de coleeción no es válida',
            errors: { message: 'Tipo de coleeción no es válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No seleccionó ningún archivo',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var ext = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos

    var extValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if ((extValidas.indexOf(ext)) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son: ' + extValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}-.${ext}`;

    // Mover el archivo del temporal a un path

    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res, path);

        /* res.status(200).json({
             ok: true,
             mensaje: 'Archivo movido con éxito',
         });*/
    });


});

function subirPorTipo(tipo, id, nombreArchivo, res, path) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                fs.unlink(path);
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            if (fs.existsSync(pathViejo)) { // Si existe, elimina la img anterior
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = '---';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                fs.unlink(path);
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            if (fs.existsSync(pathViejo)) { // Si existe, elimina la img anterior
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital actualizado',
                    usuario: hospitalActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                fs.unlink(path);
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Médico no existe',
                    errors: { message: 'Médico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            if (fs.existsSync(pathViejo)) { // Si existe, elimina la img anterior
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del médico actualizado',
                    usuario: medicoActualizado
                });
            });
        });
    }
}

module.exports = app;