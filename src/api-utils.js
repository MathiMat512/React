const API_URL = 'http://192.168.1.50:3001'; // URL base sin el prefijo /api

async function callAPI(endpoint, options = {}) {
  try {
    const { method = 'GET', params = {}, body } = options;
    const url = new URL(`${API_URL}${endpoint}`);

    // Añadir parámetros a la URL si es GET
    if (method === 'GET' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Añadir cuerpo si es POST
    if (method === 'POST' && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    console.log('Request URL:', url.toString()); // Log para depuración
    console.log('Request Options:', fetchOptions); // Log para depuración
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }
    const data = await response.json();
    console.log('Response Data:', data); // Log para depuración
    return data;
  } catch (error) {
    console.error('Error al llamar a la API:', error);
    throw error;
  }
}

const API = {
  buscar: (params) => callAPI('/api/buscar', { method: 'GET', params }), // Ajustado a GET y endpoint correcto
  ctacte: (params) => callAPI('/api/ctacte', { method: 'GET', params }), // Ajustado a GET
  deuda: (params) => callAPI('/api/deuda', { method: 'GET', params }),
  ctapagar: (params) => callAPI('/api/ctapagar', { method: 'GET', params }), // Ajustado a GET
  pendiente: (params) => callAPI('/api/pendiente', { method: 'GET', params }),
  buscarAllCOAs: () => callAPI('/allCOAs', { method: 'GET' }), // Nota: Este endpoint no existe en el backend
  login: async (usuario) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario })
      });
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }
};

window.API = API;