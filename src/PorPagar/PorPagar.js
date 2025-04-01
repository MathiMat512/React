import React, { useState, useEffect, useRef } from 'react';
import '../styles.css';
import * as XLSX from 'xlsx';

function PorPagar() {
    const [COA, setCOA] = useState('');
    const [resultados, setResultados] = useState([]);
    const [pendiente, setPendiente] = useState(null);
    const [cantidadResultados, setCantidadResultados] = useState('');
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [showModal, setShowModal] = useState(false);
    const [allCOAs, setAllCOAs] = useState([]);
    const [selectedCOAs, setSelectedCOAs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const dropdownRef = useRef(null);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const monthMap = {
        "Enero": "01", "Febrero": "02", "Marzo": "03", "Abril": "04",
        "Mayo": "05", "Junio": "06", "Julio": "07", "Agosto": "08",
        "Septiembre": "09", "Octubre": "10", "Noviembre": "11", "Diciembre": "12"
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchAllCOAs = async () => {
            setLoading(true);
            try {
                const data = await window.API.buscarAllCOAs();
                setAllCOAs(data);
                setError('');
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
        if (!dateInt) return '-';
        try {
            const dateString = dateInt.toString().padStart(8, '0');
            if (dateString.length !== 8) return '-';
            return `${dateString.slice(0, 4)}/${dateString.slice(4, 6)}/${dateString.slice(6, 8)}`;
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
                return direction === 'asc' ? aStatus - bStatus : bStatus - aStatus;
            }

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setResultados(sortedResults);
    };

    const buscarpendiente = async () => {
        if (!COA || COA.trim() === '' || COA === '.') {
            setError('Por favor ingrese un COA válido');
            alert("Por favor ingrese un COA válido");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const params = { COA };
            if (selectedYear) params.year = selectedYear;
            if (selectedMonths.length > 0) {
                params.month = selectedMonths.map(month => monthMap[month]).join(',');
            }

            const data = await window.API.ctapagar(params);
            setResultados(data.resultados);
            setCantidadResultados(<strong>Se encontró {data.resultados.length} resultado(s)</strong>);
            setError('');
        } catch (error) {
            console.error('Error:', error);
            setCantidadResultados('');
            setResultados([]);
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
            let allResults = [];
            for (const coa of coasToSearch) {
                const params = { COA: coa };
                if (selectedYear) params.year = selectedYear;
                if (selectedMonths.length > 0) {
                    params.month = selectedMonths.map(month => monthMap[month]).join(',');
                }
                const data = await window.API.ctapagar(params);
                if (data.resultados && data.resultados.length > 0) {
                    allResults = [...allResults, ...data.resultados];
                }
            }

            setResultados(allResults);
            setCantidadResultados(<strong>Se encontró {allResults.length} resultado(s)</strong>);
            setError('');
        } catch (error) {
            console.error('Error:', error);
            setCantidadResultados('');
            setResultados([]);
            setError('Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const calcularpendiente = async () => {
        if (!COA || COA.trim() === '' || COA === '.') {
            setError('Por favor ingrese un COA válido');
            alert("Por favor ingrese un COA válido");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const data = await window.API.pendiente({ COA });
            setPendiente(data[0]);
            setError('');
        } catch (error) {
            console.error('Error al calcular la deuda:', error);
            setPendiente(null);
            setError('Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const limpiar = () => {
        setCOA('');
        setResultados([]);
        setPendiente(null);
        setCantidadResultados('');
        setError('');
        setSelectedCOAs([]);
        setLoading(false);
        setSearchTerm('');
        setSelectedMonths([]);
        setSelectedYear(null);
        setIsOpen(false);
    };

    const exportToExcel = () => {
        if (resultados.length === 0 && !pendiente) {
            alert('No hay datos para exportar.');
            return;
        }

        const wb = XLSX.utils.book_new();

        if (pendiente) {
            const pendienteData = [{
                'COA': pendiente._id || '-',
                'Total Cargo': `S/ ${pendiente.totalCARGO || '-'}`,
                'Total Abono': `S/ ${pendiente.totalABONO || '-'}`,
                'Pendiente': `S/ ${pendiente.pendiente || '-'}`,
            }];
            const wsPendiente = XLSX.utils.json_to_sheet(pendienteData);
            XLSX.utils.book_append_sheet(wb, wsPendiente, 'Resumen Pendiente');
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
                'Abono en S/': item.ABONO_MN || '-',
                'Cargo en $': item.CARGO_ME || '-',
                'Abono en $': item.ABONO_ME || '-',
                'Estado': item.STAT_CANC === 'C' ? 'CANCELADO' : 'PENDIENTE'
            }));
            const wsResultados = XLSX.utils.json_to_sheet(dataForExcel);
            XLSX.utils.book_append_sheet(wb, wsResultados, 'Movimientos');
        }

        const date = new Date().toLocaleDateString().replace(/\//g, '-');
        XLSX.writeFile(wb, `cuentas_por_pagar_${date}.xlsx`);
    };

    const handleCheckboxChange = (month) => {
        setSelectedMonths(prev =>
            prev.includes(month)
                ? prev.filter(m => m !== month)
                : [...prev, month]
        );
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
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
        setSearchTerm('');
        buscarMultiple(selectedCOAs);
    };

    const filteredCOAs = allCOAs.filter(coa =>
        coa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <h1 className="text-center mb-4" style={{ fontFamily: 'Poppins' }}>
                CUENTAS POR PAGAR LANCASTER S.A
            </h1>

            <div className="row g-3 mb-4">
                <div className="col-12 col-md-12">
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            className="form-control"
                            id="COA"
                            placeholder="Ingrese el COA del proveedor"
                            style={{ fontFamily: 'Rubik' }}
                            value={COA}
                            onChange={(e) => setCOA(e.target.value)}
                        />
                        <select
                            className="form-select"
                            onChange={(e) => setSelectedYear(e.target.value)}
                            value={selectedYear || ""}
                            style={{ fontFamily: 'Rubik' }}
                        >
                            <option value="">Seleccione el año</option>
                            {(() => {
                                let years = [];
                                for (let year = 2025; year >= 2000; year--) {
                                    years.push(<option key={year} value={year}>{year}</option>);
                                }
                                return years;
                            })()}
                        </select>
                    </div>
                    <br />
                    <div className="dropdown" ref={dropdownRef}>
                        <button
                            className="btn btn-secondary dropdown-toggle"
                            type="button"
                            onClick={toggleDropdown}
                        >
                            Seleccione el mes
                        </button>
                        <div className={`dropdown-menu ${isOpen ? "show" : ""}`}>
                            {months.map((month, index) => (
                                <div key={index} className="dropdown-item" style={{ padding: 0 }}>
                                    <label
                                        htmlFor={`check-${month}`}
                                        style={{ display: 'block', width: '100%', padding: '0.25rem 1.5rem', cursor: 'pointer' }}
                                    >
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`check-${month}`}
                                                checked={selectedMonths.includes(month)}
                                                onChange={() => handleCheckboxChange(month)}
                                            />
                                            <span className="form-check-label">{month}</span>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-5">
                <div className="col-12 col-md-3">
                    <button className="btn btn-secondary btn-lg w-100" style={{ fontFamily: 'Rubik' }} onClick={buscarpendiente}>
                        Buscar
                    </button>
                </div>
                <div className="col-12 col-md-3">
                    <button className="btn btn-primary btn-lg w-100" style={{ fontFamily: 'Rubik' }} onClick={calcularpendiente}>
                        Calcular Deuda
                    </button>
                </div>
                <div className="col-12 col-md-3">
                    <button className="btn btn-danger btn-lg w-100" style={{ fontFamily: 'Rubik' }} onClick={limpiar}>
                        Limpiar Datos
                    </button>
                </div>
                <div className="col-12 col-md-3">
                    <button className="btn btn-warning btn-lg w-100" style={{ fontFamily: 'Rubik' }} onClick={() => setShowModal(true)}>
                        Búsqueda Múltiple
                    </button>
                </div>
            </div>

            <hr className="my-4" />

            <div className='div-resultados'>
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

            {pendiente && !loading && (
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
                                <td>{pendiente._id || '-'}</td>
                                <td>{`S/ ${pendiente.totalCARGO || '-'}`}</td>
                                <td>{`S/ ${pendiente.totalABONO || '-'}`}</td>
                                <td>{`S/ ${pendiente.pendiente || '-'}`}</td>
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

export default PorPagar;