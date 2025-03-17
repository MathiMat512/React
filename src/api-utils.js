const API_URL = '/api';

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
  buscar: (params) => callAPI('/clientes', params),
};

windows.API = API;