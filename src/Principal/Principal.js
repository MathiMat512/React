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
            <h3 style={{ fontFamily: 'Poppins' }}>Espacios y Departamentos</h3>
            <ul>
                <li style={{ fontFamily: 'Poppins' }}>Colaboración de Ventas</li>
                <li style={{ fontFamily: 'Poppins' }}>Anuncios de la Compañía</li>
                <li style={{ fontFamily: 'Poppins' }}>Recursos Humanos</li>
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

        <div className="section">
            <h3 style={{ fontFamily: 'Poppins' }}>Aplicaciones</h3>
            <div className="app-grid">
                <div className="app-item">
                    <img src="/api/placeholder/48/48" alt="Office 365" />
                    <p style={{ fontFamily: 'Poppins' }}>Office 365</p>
                </div>
                <div className="app-item">
                    <img src="/api/placeholder/48/48" alt="Quickbooks" />
                    <p style={{ fontFamily: 'Poppins' }}>Quickbooks</p>
                </div>
                <div className="app-item">
                    <img src="/api/placeholder/48/48" alt="Salesforce" />
                    <p style={{ fontFamily: 'Poppins' }}>Salesforce</p>
                </div>
            </div>
        </div>
    </div>
</div>
    );
}

export default Principal;