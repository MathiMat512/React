import React, { useState } from 'react';
import logo from '../images/logo.png';
import './Login.css';

function Login() {
    const [usuario, setUsuario] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [mensajeTipo, setMensajeTipo] = useState('');
  
    const mostrarMensaje = (mensaje, tipo) => {
      setMensaje(mensaje);
      setMensajeTipo(tipo);
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      const usuarioTrimmed = usuario.trim();
      if (!usuarioTrimmed) {
        mostrarMensaje('Por favor, ingrese un usuario.', 'error');
        return;
      }
  
      mostrarMensaje('Validando usuario...', 'info');
  
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ usuario: usuarioTrimmed })
        });
  
        const data = await response.json();
        console.log('Respuesta del servidor:', data);
  
        if (!response.ok) {
          throw new Error(data.mensaje || 'Error en la validación');
        }
  
        if (data.success) {
          mostrarMensaje('¡Usuario válido! Redireccionando...', 'success');
  
          // Guardar en sessionStorage
          sessionStorage.setItem('usuarioData', JSON.stringify({ usuario: data.usuario }));
          console.log('Datos guardados en sessionStorage:', sessionStorage.getItem('usuarioData'));
  
          // Redireccionar luego de 1 segundo
          setTimeout(() => {
            window.location.href = '/principal'; // Redirige a la página principal (puedes cambiarla)
          }, 1000);
        } else {
          mostrarMensaje(data.mensaje || 'Error de autenticación', 'error');
        }
  
      } catch (error) {
        console.error('Error en la petición:', error);
        mostrarMensaje('Error en el servidor. Intente nuevamente.', 'error');
      }
    };

    return (
            <div className="login-container">
            <img src={logo} alt="logo de la empresa"/>
            <h2 className='h2login'>Iniciar Sesión</h2>
            <form id="loginForm" onSubmit={handleSubmit}>
                <div className="input-grouplogin">
                    <label className='labellogin' htmlFor="usuario">Usuario:</label>
                    <input
                    className='inputlogin'
                    type="text"
                    id="usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                    />
                </div>
                <button className='buttonlogin' type="submit" id="submitBtn">Entrar</button>
                </form>
                    {mensaje && (
                    <div id="mensaje" className={`mensaje ${mensajeTipo}`}>
                        {mensaje}
                    </div>
                )}
            </div>
    );
}

export default Login;