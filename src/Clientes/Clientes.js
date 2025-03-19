import React, { useState } from 'react';
import '../styles.css';
import '../api-utils';
import * as XLSX from 'xlsx'; // Importar SheetJS

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

        const params = {};
        if (NRO_DI) params.NRO_DI = NRO_DI;
        if (DSC) params.DSC = DSC;
        if (COA) params.COA = COA;
        if (PAIS) params.PAIS = PAIS;

        if (Object.keys(params).length === 0) {
            alert("Por favor, ingresa al menos un parámetro para la búsqueda.");
            return;
        }
        
        try {
            const data = await window.API.buscar(params);
            const filteredResults = data.resultados.filter(item => item.EMPRESA === 1);
            setResultados(filteredResults);
            setCantidadResultados(`Se encontró ${filteredResults.length} resultados con los parámetros dados`);
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

    // Función para exportar a Excel (.xlsx)
    const exportToExcel = () => {
        if (resultados.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        // Mapear los datos a un formato compatible con SheetJS
        const dataForExcel = resultados.map(item => ({
            'Razón Social': item.DSC || '-',
            'Dirección': item.DIRECCION || '-',
            'Provincia': item.PROV || '-',
            'Departamento': item.DPTO || '-',
            'País': item.PAIS || '-',
            'RUC/DNI': item.NRO_DI || item.RUC || '-',
            'COA': item.COA || '-',
            'Email': item.EMAIL_FE || '-',
            'Teléfono': item.TELEFONO || item.TELEFONO1 || item.TELEFONO2 || '-',
            'Tipo de Razón Social': item.DSC_TC || '-',
            'Ubigeo': item.UBG || '-',
            'Fax': item.FAX || '-',
            'Grupo Empresarial': item.GRUPOEMP || '-'
        }));

        // Crear una hoja de trabajo
        const ws = XLSX.utils.json_to_sheet(dataForExcel);

        // Crear un libro de trabajo y añadir la hoja
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

        // Generar y descargar el archivo .xlsx
        const date = new Date().toLocaleDateString().replace(/\//g, '-');
        XLSX.writeFile(wb, `clientes_lancaster_${date}.xlsx`);
    };

    return (
        <div className="container">
            <h1 className="text-center mb-4" style={{ fontFamily: 'Poppins' }}>
                BÚSQUEDA DE CLIENTES LANCASTER S.A
            </h1>

            <div className="row g-3 mb-4">
                <div className="col-12 col-md-3">
                    <input
                        type="number"
                        className="form-control"
                        style={{ fontFamily: 'Rubik' }}
                        placeholder="Ingrese el RUC o DNI"
                        value={NRO_DI}
                        onChange={(e) => setNRO_DI(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscar()}
                    />
                </div>
                <div className="col-12 col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ingrese la razón social"
                        style={{ fontFamily: 'Rubik' }}
                        value={DSC}
                        onChange={(e) => setDSC(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscar()}
                    />
                </div>
                <div className="col-12 col-md-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ingrese el COA"
                        style={{ fontFamily: 'Rubik' }}
                        value={COA}
                        onChange={(e) => setCOA(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscar()}
                    />
                </div>
                <div className="col-12 col-md-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ingrese el país"
                        style={{ fontFamily: 'Rubik' }}
                        value={PAIS}
                        onChange={(e) => setPAIS(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscar()}
                    />
                </div>
            </div>

            <div className="row g-3 mb-5">
                <div className="col-12 col-md-6">
                    <button className="btn btn-secondary btn-lg w-100" style={{ fontFamily: 'Rubik' }} onClick={buscar}>Buscar</button>
                </div>
                <div className="col-12 col-md-6">
                    <button className="btn btn-danger btn-lg w-100" style={{ fontFamily: 'Rubik' }} onClick={limpiar}>Limpiar Datos</button>
                </div>
            </div>

            <hr className="my-4" />

            <div className='div-resultados'>
                <h2>Resultados:</h2>
                <button className="btn btn-success btn-lg w-25" style={{ fontFamily: 'Rubik' }} onClick={exportToExcel}>
                    <i class="fa-solid fa-file-arrow-down"></i> Exportar a Excel
                </button>
            </div>
            
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
                                <div className="mb-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setClienteSeleccionado(item);
                                            setMostrarModal(true);
                                        }}
                                    >
                                        Detalles
                                    </button>
                                </div>
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
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setClienteSeleccionado(item);
                                                setMostrarModal(true);
                                            }}
                                        >
                                            Detalles
                                        </button>
                                    </td>
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
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setMostrarModal(false)}
                                    ></button>
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
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setMostrarModal(false)}
                                    >
                                        Cerrar
                                    </button>
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