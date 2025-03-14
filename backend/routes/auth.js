const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario.model'); // Esta ruta ahora coincide con tu estructura

router.post('/login', async (req, res) => {
    try {
        const { usuario } = req.body;
        console.log('Usuario recibido:', usuario); // Debug log
        
        if (!usuario) {
            return res.status(400).json({ 
                success: false,
                mensaje: 'Usuario requerido' 
            });
        }

        const usuarioEncontrado = await Usuario.findOne({ usuario });
        console.log('Usuario encontrado:', usuarioEncontrado); // Debug log
        
        if (usuarioEncontrado) {
            res.json({ 
                success: true,
                mensaje: 'Usuario válido',
                usuario: usuarioEncontrado
            });
        } else {
            res.status(401).json({ 
                success: false,
                mensaje: 'Usuario no encontrado o inactivo' 
            });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false,
            mensaje: 'Error en el servidor' 
        });
    }
});

module.exports = router;