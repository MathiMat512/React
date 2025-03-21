const API_URL = 'http://192.168.1.50:3001/api';

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

    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al llamar a la API:', error);
    throw error;
  }
}

const API = {
  buscar: (params) => callAPI('/buscar', { method: 'POST', body: params }),
  ctacte: (params) => callAPI('/ctacte', { method: 'POST', body: params }),
  deuda: (params) => callAPI('/deuda', { method: 'GET', params }),
  ctapagar: (params) => callAPI('/ctapagar', { method: 'POST', body: params }),
  pendiente: (params) => callAPI('/pendiente', { method: 'GET', params }),
  buscarAllCOAs: () => callAPI('/allCOAs', { method: 'GET' }),
  login: async (usuario) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
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