const express = require('express');
const mongoose = require('mongoose');
const Lancaster = require('./models/lancaster.model'); // Importa el modelo
const Ctacte = require('./models/ctacte.model'); // Importa el modelo
const Ctapagar = require('./models/ctapagar.model'); // Importa el modelo
const cors = require('cors');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();
app.use(cors({
  origin: 'http://192.168.1.63:3001',
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

  /* api de paginacion */
  app.get('/api/PruebasDeDatos', async (req, res) => {
    try {
      // Parámetros de consulta para la paginación
      const page = parseInt(req.query.page) || 1; // Página por defecto: 1
      const limit = parseInt(req.query.limit) || 200; // Limite por defecto: 10 registros por página
  
      // Calculamos el número de registros a saltar (skip)
      const skip = (page - 1) * limit;
  
      // Ejecutamos la consulta con paginación
      const datos = await Lancaster.find()
        .skip(skip) // Saltar los primeros registros
        .limit(limit); // Limitar el número de registros
  
      // Contar el total de registros para la paginación
      const totalCount = await Lancaster.countDocuments();
  
      // Responder con los datos paginados y el total de registros
      res.json({
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit), // Número total de páginas
        datos,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }); 

  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  /* buscar múltiple */
app.get('/api/buscar', async (req, res) => {
  try {
    const { NRO_DI, DSC, COA, PAIS} = req.query; // Obtiene los parámetros desde la URL
    
    // Construir el objeto de consulta dinámicamente
    let query = {};

    if (NRO_DI) {
      query.$or = [
        { NRO_DI: { $regex: NRO_DI, $options: 'i' } }
      ];
    }

    // Si se proporciona el parámetro DSC (Razón Social), agregarlo a la consulta
    if (DSC) {
      // Dividir el DSC en palabras clave y escapar caracteres especiales
      const keywords = DSC.split(/\s+/)
                         .filter(k => k.trim() !== '')
                         .map(k => escapeRegex(k));
      
      if (keywords.length > 0) {
        // Crear regex que busque todas las palabras en cualquier orden
        const regexPattern = keywords.map(k => `(?=.*${k})`).join('') + '.*';
        query.DSC = { $regex: regexPattern, $options: 'i' };
      }
    }

    // Si se proporciona el parámetro COA, agregarlo a la consulta
    if (COA) {
      query.COA = { $regex: COA, $options: 'i' };
    }

    if (PAIS) {
      query.PAIS = { $regex: PAIS, $options: 'i' };
    }

    // Realizar la búsqueda en la base de datos con los parámetros construidos
    const resultado = await Lancaster.aggregate([
      { $match: query }, // Filtrar por los criterios de búsqueda
    ]);
    
    const cantidadResultados = resultado.length;

    // Si no se encuentran resultados
    if (cantidadResultados === 0) {
      return res.status(404).json({ message: 'No se encontraron resultados para los parámetros proporcionados' });
    }

    // Responder con los resultados
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
    const { COA } = req.query;

    let query = {};

    if (COA) {
      query.COA = COA; // Búsqueda exacta en lugar de regex
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
      const {COA} = req.query;

      let matchStage = {};

      if(COA){
        matchStage.COA = {$regex: COA, $options: 'i'}
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
              deuda: {$toString: {$round: ["$deuda", 2]}}
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
    const { COA } = req.query;

    let query = {};

    if (COA) {
      query.COA = COA; // Búsqueda exacta en lugar de regex
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
      const {COA} = req.query;

      let matchStage = {};

      if(COA){
        matchStage.COA = {$regex: COA, $options: 'i'}
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
              pendiente: {$toString: {$round: ["$pendiente", 2]}}
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

// Iniciar el servidor
app.listen(3001, '0.0.0.0', () => {
  console.log('Servidor ejecutándose en http://localhost:3001');
});