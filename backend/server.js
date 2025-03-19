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
  origin: 'http://localhost:3001',
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

/* API de paginación */
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

/* Buscar múltiple */
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

// API para obtener todos los COAs disponibles
app.get('/api/allCOAs', async (req, res) => {
  try {
    const coas = await Ctacte.distinct('COA');
    if (coas.length === 0) {
      return res.status(404).json({ message: 'No se encontraron COAs disponibles' });
    }
    res.json(coas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// API de CTACTE
app.post('/api/ctacte', async (req, res) => {
  try {
    const { COAs } = req.body;

    if (!COAs || !Array.isArray(COAs) || COAs.length === 0) {
      return res.status(400).json({ message: 'Debe proporcionar al menos un COA válido' });
    }

    const resultado = await Ctacte.find({ COA: { $in: COAs } });

    if (resultado.length === 0) {
      return res.status(404).json({
        message: 'No se encontraron resultados para los COAs especificados',
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

// API de deuda
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

    if (resultado.length === 0) {
      return res.status(404).json({ message: `El COA ${COA} no existe o no tiene datos asociados` });
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: "Error al calcular la deuda", error });
  }
});

// API de Ctapagar
app.post('/api/ctapagar', async (req, res) => {
  try {
    const { COAs } = req.body;

    if (!COAs || !Array.isArray(COAs) || COAs.length === 0) {
      return res.status(400).json({ message: 'Debe proporcionar al menos un COA válido' });
    }

    const resultado = await Ctapagar.find({ COA: { $in: COAs } });

    if (resultado.length === 0) {
      return res.status(404).json({
        message: `Ninguno de los COAs (${COAs.join(', ')}) existe o tiene datos asociados`,
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

// API de pendiente
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

    if (resultado.length === 0) {
      return res.status(404).json({ message: `El COA ${COA} no existe o no tiene datos asociados` });
    }

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

// Iniciar el servidor
app.listen(3001, '0.0.0.0', () => {
  console.log('Servidor ejecutándose en http://localhost:3001');
});