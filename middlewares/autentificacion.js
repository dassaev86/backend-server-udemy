var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


// ===========================================================================
// Verificar Token - Middleware
// ===========================================================================

exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        next();

        req.usuario = decoded.usuario;

        /*  res.status(200).json({
              ok: true,
              mensaje: 'Token incorrecto',
              decoded: decoded
          }); */
    });
}



// ===========================================================================
// Verificar Token
// ===========================================================================