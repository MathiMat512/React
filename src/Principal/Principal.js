import './Principal.css';
import '../SideNav/SideNav';

function Principal() {
    return (
<div>
    <div className="hero-section">
        <h1 style={{ color: 'white', textShadow: '2px 2px 2px black', fontSize: '50px' }}>
            Bienvenido a Lancaster S.A
        </h1>
        <div className="quick-nav">
            <h3 style={{ fontFamily: 'Poppins' }}>¿Qué deseas buscar?</h3>
            <div className="quick-nav-buttons">
                <button className="nav-button1" onClick={() => (window.location.href = 'clientes')}>
                    <i className="fa-solid fa-search"></i> Búsqueda de Clientes
                </button>
                <button className="nav-button1" onClick={() => (window.location.href = 'porcobrar')}>
                    <i className="fa-solid fa-users"></i> Consultar deudas de clientes
                </button>
                <button className="nav-button1" onClick={() => (window.location.href = 'porpagar')}>
                    <i className="fa-solid fa-circle-question"></i> Consultar deudas por pagar
                </button>
            </div>
        </div>
        <p style={{ fontFamily: 'Poppins' }}>
            ¿Tienes alguna pregunta que podamos ayudarte a resolver?
        </p>
    </div>

    <div className="content-area">
        <div className="section">
            <h3 style={{ fontFamily: 'Poppins' }}>Redes sociales y Externos</h3>
            <ul>
                <li style={{ fontFamily: 'Poppins' }}><i className="fa-solid fa-globe"></i><a style={{textDecoration:'none'}} href='https://www.lancaster.pe/#/home' target='blank'> Sitio web Ecommerce</a></li>
                <li style={{ fontFamily: 'Poppins' }}><i class="fa-solid fa-thumbs-up"></i><a style={{textDecoration:'none'}} href='https://www.facebook.com/Lancaster.peru' target='blank'> Facebook</a></li>
                <li style={{ fontFamily: 'Poppins' }}><i class="fa-solid fa-camera"></i><a style={{textDecoration:'none'}} href='https://www.instagram.com/lancaster_peru/#' target='blank'> Instagram</a></li>
                <li style={{ fontFamily: 'Poppins' }}><i class="fa-solid fa-location-dot"></i> Prolongación Huamanga 890 - La Victoria</li>
                <li style={{ fontFamily: 'Poppins' }}><i class="fa-solid fa-phone"></i> Teléfono: (01) 474-5711 / (01) 474-5744</li>
                <li style={{ fontFamily: 'Poppins' }}><i class="fa-solid fa-envelope"></i> Email: info@lancaster.com.pe</li>
            </ul>
        </div>

        <div className="section">
            <h3 style={{ fontFamily: 'Poppins' }}>Enlaces Rápidos</h3>
            <ul>
                <li style={{ fontFamily: 'Poppins' }}>Directorio de Personal</li>
                <li style={{ fontFamily: 'Poppins' }}>Organigrama</li>
                <li style={{ fontFamily: 'Poppins' }}>Calendario de la Empresa</li>
                <li style={{ fontFamily: 'Poppins' }}>Políticas y Procedimientos</li>
            </ul>
        </div>
    </div>
        <div style={{ textAlign: 'center', padding: '10px' }}>
            <h5 style={{ fontFamily: 'Poppins' }}>2025 Todos los derechos reservados</h5>
        </div>
</div>
    );
}

export default Principal;