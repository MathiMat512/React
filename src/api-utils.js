const API_URL = 'http://192.168.1.63:3001/api';

async function callAPI(endpoint, params = {}) {
    try {
        const url = new URL(`${API_URL}${endpoint}`, window.location.origin);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        const response = await fetch(url);
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
  buscar: (params) => callAPI('/buscar', params),
  ctacte: (params) => callAPI('/ctacte', params),
  deuda: (params) => callAPI('/deuda', params),
  ctapagar: (params) => callAPI('/ctapagar', params),
  pendiente: (params) => callAPI('/pendiente', params),
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