const express = require('express');
const mongoose = require('mongoose');
const Lancaster = require('./models/lancaster.model');
const Ctacte = require('./models/ctacte.model');
const Ctapagar = require('./models/ctapagar.model');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://192.168.1.50:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../build')));

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/Prueba1', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error(err));

// Endpoint para obtener todos los COAs
app.get('/allCOAs', async (req, res) => {
    try {
        const coas = await Lancaster.distinct('COA');
        res.json(coas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Api de paginacion
app.get('/api/PruebasDeDatos', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 200;
        const skip = (page - 1) * limit;
        const datos = await Lancaster.find()
            .skip(skip)
            .limit(limit);
        const totalCount = await Lancaster.countDocuments();
        res.json({
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
            datos,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Buscar múltiple
app.get('/api/buscar', async (req, res) => {
    try {
        const { NRO_DI, DSC, COA, PAIS } = req.query;
        let query = {};

        if (NRO_DI) {
            query.$or = [
                { NRO_DI: { $regex: NRO_DI, $options: 'i' } }
            ];
        }

        if (DSC) {
            const keywords = DSC.split(/\s+/)
                .filter(k => k.trim() !== '')
                .map(k => escapeRegex(k));
            if (keywords.length > 0) {
                const regexPattern = keywords.map(k => `(?=.*${k})`).join('') + '.*';
                query.DSC = { $regex: regexPattern, $options: 'i' };
            }
        }

        if (COA) {
            query.COA = { $regex: COA, $options: 'i' };
        }

        if (PAIS) {
            query.PAIS = { $regex: PAIS, $options: 'i' };
        }

        const resultado = await Lancaster.aggregate([
            { $match: query },
        ]);

        const cantidadResultados = resultado.length;

        if (cantidadResultados === 0) {
            return res.status(404).json({ message: 'No se encontraron resultados para los parámetros proporcionados' });
        }

        res.json({
            cantidadResultados: cantidadResultados,
            resultados: resultado
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Api de CTACTE
app.get('/api/ctacte', async (req, res) => {
    try {
        const { COA, year, month } = req.query;
        let query = {};

        if (COA) {
            query.COA = COA;
        }

        if (year) {
            let startDates = [];
            let endDates = [];

            if (month) {
                const months = month.split(',').map(m => parseInt(m, 10));
                months.forEach(m => {
                    const daysInMonth = new Date(year, m, 0).getDate();
                    const startDate = parseInt(`${year}${m.toString().padStart(2, '0')}01`, 10);
                    const endDate = parseInt(`${year}${m.toString().padStart(2, '0')}${daysInMonth}`, 10);
                    startDates.push(startDate);
                    endDates.push(endDate);
                });

                query.DOC_FCH = {
                    $gte: Math.min(...startDates),
                    $lte: Math.max(...endDates)
                };
            } else {
                const startDate = parseInt(`${year}0101`, 10);
                const endDate = parseInt(`${year}1231`, 10);
                query.DOC_FCH = { $gte: startDate, $lte: endDate };
            }
        }

        const resultado = await Ctacte.find(query);

        if (resultado.length === 0) {
            return res.status(404).json({
                message: 'No se encontraron resultados para el COA especificado',
                cantidadResultados: 0,
                resultados: []
            });
        }

        res.json({
            cantidadResultados: resultado.length,
            resultados: resultado
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/deuda', async (req, res) => {
    try {
        const { COA } = req.query;
        let matchStage = {};

        if (COA) {
            matchStage.COA = { $regex: COA, $options: 'i' };
        }

        const resultado = await Ctacte.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$COA",
                    totalCARGO: { $sum: "$CARGO_MN" },
                    totalABONO: { $sum: "$ABONO_MN" }
                }
            },
            {
                $addFields: {
                    deuda: { $subtract: ["$totalCARGO", "$totalABONO"] }
                }
            },
            { $sort: { deuda: -1 } },
            {
                $addFields: {
                    deuda: { $toString: { $round: ["$deuda", 2] } }
                }
            }
        ]);

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ message: "Error al calcular la deuda", error });
    }
});

// Api de Ctapagar
app.get('/api/ctapagar', async (req, res) => {
    try {
        const { COA, year, month } = req.query;
        let query = {};

        if (COA) {
            query.COA = COA;
        }

        if (year) {
            let startDates = [];
            let endDates = [];

            if (month) {
                const months = month.split(',').map(m => parseInt(m, 10));
                months.forEach(m => {
                    const daysInMonth = new Date(year, m, 0).getDate();
                    const startDate = parseInt(`${year}${m.toString().padStart(2, '0')}01`, 10);
                    const endDate = parseInt(`${year}${m.toString().padStart(2, '0')}${daysInMonth}`, 10);
                    startDates.push(startDate);
                    endDates.push(endDate);
                });

                query.DOC_FCH = {
                    $gte: Math.min(...startDates),
                    $lte: Math.max(...endDates)
                };
            } else {
                const startDate = parseInt(`${year}0101`, 10);
                const endDate = parseInt(`${year}1231`, 10);
                query.DOC_FCH = { $gte: startDate, $lte: endDate };
            }
        }

        const resultado = await Ctapagar.find(query);

        if (resultado.length === 0) {
            return res.status(404).json({
                message: 'No se encontraron resultados para el COA especificado',
                cantidadResultados: 0,
                resultados: []
            });
        }

        res.json({
            cantidadResultados: resultado.length,
            resultados: resultado
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/pendiente', async (req, res) => {
    try {
        const { COA } = req.query;
        let matchStage = {};

        if (COA) {
            matchStage.COA = { $regex: COA, $options: 'i' };
        }

        const resultado = await Ctapagar.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$COA",
                    totalCARGO: { $sum: "$CARGO_MN" },
                    totalABONO: { $sum: "$ABONO_MN" }
                }
            },
            {
                $addFields: {
                    pendiente: { $subtract: ["$totalABONO", "$totalCARGO"] }
                }
            },
            { $sort: { deuda: -1 } },
            {
                $addFields: {
                    pendiente: { $toString: { $round: ["$pendiente", 2] } }
                }
            }
        ]);

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ message: "Error al calcular la deuda pendiente", error });
    }
});

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(3001, '0.0.0.0', () => {
    console.log('Servidor ejecutándose en http://192.168.1.50:3001');
});