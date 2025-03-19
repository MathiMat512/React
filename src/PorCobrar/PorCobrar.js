import React, { useState, useEffect } from 'react';
import '../styles.css';
import '../api-utils';
import * as XLSX from 'xlsx';

function PorCobrar() {
    const [COA, setCOA] = useState('');
    const [resultados, setResultados] = useState([]);
    const [deuda, setDeuda] = useState(null);
    const [cantidadResultados, setCantidadResultados] = useState('');
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [showModal, setShowModal] = useState(false);
    const [allCOAs, setAllCOAs] = useState([]);
    const [selectedCOAs, setSelectedCOAs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // Nuevo estado para el término de búsqueda

    useEffect(() => {
        const fetchAllCOAs = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3001/api/allCOAs');
                const data = await response.json();
                if (response.ok) {
                    setAllCOAs(data);
                } else {
                    setError(data.message || 'Error al cargar la lista de COAs');
                }
            } catch (error) {
                console.error('Error al cargar COAs:', error);
                setError('Error al cargar la lista de COAs');
            } finally {
                setLoading(false);
            }
        };
        fetchAllCOAs();
    }, []);

    const formatDateWithSlashes = (dateInt) => {
        if (!dateInt) {
            return '-';
        }
        try {
            const dateString = dateInt.toString().padStart(8, '0');
            if (dateString.length !== 8) {
                return '-';
            }
            return dateString.slice(0, 4) + '/' + dateString.slice(4, 6) + '/' + dateString.slice(6, 8);
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return '-';
        }
    };

    const sortTableByColumn = (columnKey) => {
        let direction = 'asc';
        if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: columnKey, direction });

        const sortedResults = [...resultados].sort((a, b) => {
            const aValue = a[columnKey];
            const bValue = b[columnKey];

            if (columnKey === 'STAT_CANC') {
                const aStatus = aValue === 'C' ? 1 : 0;
                const bStatus = bValue === 'C' ? 1 : 0;

                if (direction === 'asc') {
                    return aStatus - bStatus;
                } else {
                    return bStatus - aStatus;
                }
            }

            if (aValue < bValue) {
                return direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return direction === 'asc' ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
        });

        setResultados(sortedResults);
    };

    const buscarsaldo = async () => {
        if (!COA || COA === '.' || COA.length === 0) {
            setError('Por favor ingrese un COA válido');
            alert("Por favor ingrese un COA válido");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:3001/api/ctacte', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ COAs: [COA] }),
            });
            const data = await response.json();
            if (response.ok) {
                setResultados(data.resultados);
                setCantidadResultados(<strong>Se encontró {data.resultados.length} resultado(s)</strong>);
                setError('');
            } else {
                setCantidadResultados('');
                setResultados([]);
                setError(data.message || 'No se encontraron resultados para el COA especificado');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const buscarMultiple = async (coasToSearch) => {
        if (!coasToSearch || coasToSearch.length === 0) {
            setError('Por favor seleccione al menos un COA');
            alert("Por favor seleccione al menos un COA");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:3001/api/ctacte', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ COAs: coasToSearch }),
            });

            const data = await response.json();
            if (response.ok) {
                setResultados(data.resultados);
                setCantidadResultados(<strong>Se encontró {data.resultados.length} resultado(s)</strong>);
                setError('');
            } else {
                setCantidadResultados('');
                setResultados([]);
                setError(data.message || 'No se encontraron resultados para los COAs especificados');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const calcularsaldo = async () => {
        if (!COA || COA === '.' || COA.length === 0) {
            setError('Por favor ingrese un COA válido');
            alert("Por favor ingrese un COA válido");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:3001/api/deuda?COA=${COA}`);
            const data = await response.json();
            if (response.ok) {
                setDeuda(data[0]);
                setError('');
            } else {
                setDeuda(null);
                setError(data.message || 'No se encontraron resultados para el COA especificado');
            }
        } catch (error) {
            console.error('Error al calcular la deuda:', error);
            setError('Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const limpiar = () => {
        setCOA('');
        setResultados([]);
        setDeuda(null);
        setCantidadResultados('');
        setError('');
        setSelectedCOAs([]);
        setLoading(false);
        setSearchTerm(''); // Limpiar el término de búsqueda al limpiar datos
    };

    const exportToExcel = () => {
        if (resultados.length === 0 && !deuda) {
            alert('No hay datos para exportar.');
            return;
        }

        const wb = XLSX.utils.book_new();

        if (deuda) {
            const deudaData = [
                {
                    'COA': deuda._id || '-',
                    'Total Cargo': `S/ ${deuda.totalCARGO || '-'}`,
                    'Total Abono': `S/ ${deuda.totalABONO || '-'}`,
                    'Deuda': `S/ ${deuda.deuda || '-'}`,
                }
            ];
            const wsDeuda = XLSX.utils.json_to_sheet(deudaData);
            XLSX.utils.book_append_sheet(wb, wsDeuda, 'Resumen Deuda');
        }

        if (resultados.length > 0) {
            const dataForExcel = resultados.map(item => ({
                'COA': item.COA || '-',
                'Doc': item.DOC || '-',
                'Serie': item.DOC_SERIE || '-',
                'Número': item.DOC_NRO || '-',
                'Fecha': formatDateWithSlashes(item.DOC_FCH),
                'Moneda': item.MON || '-',
                'Cargo en S/.': item.CARGO_MN || '-',
                'Abono en S/.': item.ABONO_MN || '-',
                'Cargo en $': item.CARGO_ME || '-',
                'Abono en $': item.ABONO_ME || '-',
                'Estado': item.STAT_CANC === 'C' ? 'CANCELADO' : 'PENDIENTE'
            }));
            const wsResultados = XLSX.utils.json_to_sheet(dataForExcel);
            XLSX.utils.book_append_sheet(wb, wsResultados, 'Movimientos');
        }

        const date = new Date().toLocaleDateString().replace(/\//g, '-');
        XLSX.writeFile(wb, `cuentas_por_cobrar_${date}.xlsx`);
    };

    const handleCOAToggle = (coa) => {
        setSelectedCOAs(prev =>
            prev.includes(coa)
                ? prev.filter(c => c !== coa)
                : [...prev, coa]
        );
    };

    const handleMultipleSearch = () => {
        if (selectedCOAs.length === 0) {
            alert('Por favor seleccione al menos un COA');
            return;
        }
        setShowModal(false);
        setSearchTerm(''); // Limpiar el término de búsqueda al buscar
        buscarMultiple(selectedCOAs);
    };

    // Filtrar COAs según el término de búsqueda
    const filteredCOAs = allCOAs.filter(coa =>
        coa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <h1 className="text-center mb-4" style={{ fontFamily: 'Poppins' }}>
                CUENTAS POR COBRAR DE CLIENTES LANCASTER S.A
            </h1>

            <div className="row g-3 mb-4">
                <div className="col-12 col-md-12">
                    <input
                        type="text"
                        className="form-control"
                        id="COA"
                        placeholder="Ingrese el COA del cliente"
                        value={COA}
                        onChange={(e) => setCOA(e.target.value)}
                    />
                </div>
            </div>

            <div className="row g-3 mb-5">
                <div className="col-12 col-md-3">
                    <button className="btn btn-secondary btn-lg w-100" onClick={buscarsaldo}>
                        Buscar
                    </button>
                </div>
                <div className="col-12 col-md-3">
                    <button className="btn btn-primary btn-lg w-100" onClick={calcularsaldo}>
                        Calcular Deuda
                    </button>
                </div>
                <div className="col-12 col-md-3">
                    <button className="btn btn-danger btn-lg w-100" onClick={limpiar}>
                        Limpiar Datos
                    </button>
                </div>
                <div className="col-12 col-md-3">
                    <button className="btn btn-warning btn-lg w-100" onClick={() => setShowModal(true)}>
                        Búsqueda Múltiple
                    </button>
                </div>
            </div>

            <hr className="my-4" />

            <div className="div-resultados">
                <h2>Resultados:</h2>
                <button className="btn btn-success btn-lg w-25" style={{ fontFamily: 'Rubik' }} onClick={exportToExcel}>
                    <i className="fa-solid fa-file-arrow-down"></i> Exportar a Excel
                </button>
            </div>

            {loading && (
                <div className="loading-socks">
                    <div>
                        <span className="sock">🧦</span>
                        <span className="sock">🧦</span>
                        <span className="sock">🧦</span>
                    </div>
                    <p className="loading-text">Cargando datos...</p>
                </div>
            )}

            {error && !loading && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {deuda && !loading && (
                <div className="bg-light p-3 rounded table-responsive">
                    <table className="table table-striped table-hover table-sm">
                        <thead className="table-primary">
                            <tr>
                                <th>COA</th>
                                <th>Total Cargo</th>
                                <th>Total Abono</th>
                                <th>Deuda</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{deuda._id || '-'}</td>
                                <td>{`S/ ${deuda.totalCARGO || '-'}`}</td>
                                <td>{`S/ ${deuda.totalABONO || '-'}`}</td>
                                <td>{`S/ ${deuda.deuda || '-'}`}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {cantidadResultados && !loading && <p className="text-muted">{cantidadResultados}</p>}

            {resultados.length > 0 && !loading && (
                <div className="bg-light p-3 rounded table-responsive">
                    <table className="table table-striped table-hover table-sm">
                        <thead className="table-primary">
                            <tr>
                                <th>COA</th>
                                <th>Doc</th>
                                <th>Serie</th>
                                <th>Número</th>
                                <th className='sortable' onClick={() => sortTableByColumn('DOC_FCH')}>
                                    Fecha {sortConfig.key === 'DOC_FCH' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Moneda</th>
                                <th>Cargo en S/.</th>
                                <th>Abono en S/.</th>
                                <th>Cargo en $</th>
                                <th>Abono en $</th>
                                <th className='sortable' onClick={() => sortTableByColumn('STAT_CANC')}>
                                    Estado {sortConfig.key === 'STAT_CANC' && (sortConfig.direction === 'asc' ? '↓' : '↑')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultados.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.COA || '-'}</td>
                                    <td>{item.DOC || '-'}</td>
                                    <td>{item.DOC_SERIE || '-'}</td>
                                    <td>{item.DOC_NRO || '-'}</td>
                                    <td>{formatDateWithSlashes(item.DOC_FCH)}</td>
                                    <td>{item.MON || '-'}</td>
                                    <td>{item.CARGO_MN || '-'}</td>
                                    <td>{item.ABONO_MN || '-'}</td>
                                    <td>{item.CARGO_ME || '-'}</td>
                                    <td>{item.ABONO_ME || '-'}</td>
                                    <td>{item.STAT_CANC === 'C' ? <span style={{ color: 'red' }}>CANCELADO</span> : <span style={{ color: 'green' }}>PENDIENTE</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">Búsqueda Múltiple de COAs</h1>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Seleccione los COAs para buscar:</p>
                                {/* Campo de búsqueda */}
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Buscar COA..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {filteredCOAs.length > 0 ? (
                                        filteredCOAs.map((coa, index) => (
                                            <div key={index} className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`coa-${index}`}
                                                    checked={selectedCOAs.includes(coa)}
                                                    onChange={() => handleCOAToggle(coa)}
                                                />
                                                <label className="form-check-label" htmlFor={`coa-${index}`}>
                                                    {coa}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No se encontraron COAs que coincidan con la búsqueda.</p>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cerrar
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleMultipleSearch}>
                                    Buscar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PorCobrar;