import React, { useState } from 'react';
import '../styles.css';

function Clientes() {
    const [NRO_DI, setNRO_DI] = useState('');
    const [DSC, setDSC] = useState('');
    const [COA, setCOA] = useState('');
    const [PAIS, setPAIS] = useState('');
    const [resultados, setResultados] = useState([]);
    const [cantidadResultados, setCantidadResultados] = useState('');
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    const buscar = async () => {
        if ([NRO_DI, DSC, COA, PAIS].some(val => val.trim() === '.')) {
            alert("Por favor, ingrese valores válidos para la búsqueda.");
            return;
        }

        let queryParams = [];
        if (NRO_DI) queryParams.push(`NRO_DI=${NRO_DI}`);
        if (DSC) queryParams.push(`DSC=${DSC}`);
        if (COA) queryParams.push(`COA=${COA}`);
        if (PAIS) queryParams.push(`PAIS=${PAIS}`);

        if (queryParams.length === 0) {
            alert("Por favor, ingresa al menos un parámetro para la búsqueda.");
            return;
        }

        const queryString = queryParams.join('&');
        const apiUrl = `http://localhost:3001/api/buscar?${queryString}`;
        const abrirModal = (cliente) => {
            setClienteSeleccionado(cliente);
            setMostrarModal(true);
        };
        
        const cerrarModal = () => {
            setClienteSeleccionado(null);
            setMostrarModal(false);
        };
        
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (response.ok) {
                const filteredResults = data.resultados.filter(item => item.EMPRESA === 1);
                setResultados(filteredResults);
                setCantidadResultados(<strong>Se encontró {filteredResults.length} resultados con los parámetros dados</strong>);
            } else {
                setResultados([]);
                setCantidadResultados(data.message || 'No se encontraron resultados');
            }
        } catch (error) {
            console.error('Error de búsqueda:', error);
            alert('Hubo un error en la búsqueda, por favor inténtalo nuevamente.');
        }
    };

    const limpiar = () => {
        setNRO_DI('');
        setDSC('');
        setCOA('');
        setPAIS('');
        setResultados([]);
        setCantidadResultados('');
    };

    return (
        <div className="container">
            <h1 className="text-center mb-4" style={{ fontFamily: 'Poppins' }}>
                BÚSQUEDA DE CLIENTES LANCASTER S.A
            </h1>

            <div className="row g-3 mb-4">
                <div className="col-12 col-md-3">
                    <input type="number" className="form-control" placeholder="Ingrese el RUC o DNI"
                        value={NRO_DI} onChange={(e) => setNRO_DI(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscar()} />
                </div>
                <div className="col-12 col-md-4">
                    <input type="text" className="form-control" placeholder="Ingrese la razón social"
                        value={DSC} onChange={(e) => setDSC(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscar()} />
                </div>
                <div className="col-12 col-md-2">
                    <input type="text" className="form-control" placeholder="Ingrese el COA"
                        value={COA} onChange={(e) => setCOA(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscar()} />
                </div>
                <div className="col-12 col-md-3">
                    <input type="text" className="form-control" placeholder="Ingrese el país"
                        value={PAIS} onChange={(e) => setPAIS(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscar()} />
                </div>
            </div>

            <div className="row g-3 mb-5">
                <div className="col-12 col-md-6">
                    <button className="btn btn-secondary btn-lg w-100" onClick={buscar}>Buscar</button>
                </div>
                <div className="col-12 col-md-6">
                    <button className="btn btn-danger btn-lg w-100" onClick={limpiar}>Limpiar Datos</button>
                </div>
            </div>

            <hr className="my-4" />

            <h2>Resultados:</h2>
            <p className="text-muted">{cantidadResultados}</p>
            <div className="bg-light p-3 rounded table-responsive">
                {/* Vista Móvil - Cards */}
                <div className="d-md-none">
                    {resultados.map((item, index) => (
                        <div key={index} className="card mb-3">
                            <div className="card-body">
                                <div className="mb-2"><strong>Razón Social:</strong> {item.DSC || '-'}</div>
                                <div className="mb-2"><strong>Dirección:</strong> {item.DIRECCION || '-'}</div>
                                <div className="mb-2"><strong>Provincia:</strong> {item.PROV || '-'}</div>
                                <div className="mb-2"><strong>Departamento:</strong> {item.DPTO || '-'}</div>
                                <div className="mb-2"><strong>País:</strong> {item.PAIS || '-'}</div>
                                <div className="mb-2"><strong>RUC/DNI:</strong> {item.NRO_DI || item.RUC || '-'}</div>
                                <div className="mb-2"><strong>COA:</strong> {item.COA || '-'}</div>
                                <div className="mb-2"><button type="button" className="btn btn-primary" onClick={() => {
                                    setClienteSeleccionado(item);
                                    setMostrarModal(true);
                                }}>
                                    Detalles
                                </button></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Vista Desktop - Tabla */}
                <div className="d-none d-md-block">
                    <table className="table table-striped table-hover table-sm">
                        <thead className="table-primary">
                            <tr>
                                <th>Razón Social</th>
                                <th>Dirección</th>
                                <th>Provincia</th>
                                <th>Departamento</th>
                                <th>País</th>
                                <th>RUC/DNI</th>
                                <th>COA</th>
                                <th>Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultados.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.DSC || '-'}</td>
                                    <td>{item.DIRECCION || '-'}</td>
                                    <td>{item.PROV || '-'}</td>
                                    <td>{item.DPTO || '-'}</td>
                                    <td>{item.PAIS || '-'}</td>
                                    <td>{item.NRO_DI || item.RUC || '-'}</td>
                                    <td>{item.COA || '-'}</td>
                                    <td><button type="button" className="btn btn-primary" onClick={() => {
                                        setClienteSeleccionado(item);
                                        setMostrarModal(true);
                                    }}>
                                        Detalles
                                    </button></td>
                                </tr>
                                
                            ))}
                        </tbody>
                    </table>
                </div>

                {mostrarModal && clienteSeleccionado && (
                        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h1 className="modal-title fs-5">Detalles de {clienteSeleccionado.DSC}</h1>
                                        <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className='mb-2'><strong>Email:</strong> {clienteSeleccionado.EMAIL_FE || '-'}</div>
                                        <div className='mb-2'><strong>Teléfono:</strong> {clienteSeleccionado.TELEFONO || clienteSeleccionado.TELEFONO1 || clienteSeleccionado.TELEFONO2 || '-'}</div>
                                        <div className='mb-2'><strong>Tipo de Razón Social:</strong> {clienteSeleccionado.DSC_TC || '-'}</div>
                                        <div className='mb-2'><strong>Ubigeo:</strong> {clienteSeleccionado.UBG || '-'}</div>
                                        <div className='mb-2'><strong>Fax:</strong> {clienteSeleccionado.FAX || '-'}</div>
                                        <div className='mb-2'><strong>Grupo Empresarial:</strong> {clienteSeleccionado.GRUPOEMP || '-'}</div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cerrar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}

export default Clientes;
