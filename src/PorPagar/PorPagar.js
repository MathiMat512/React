import React, { useState, useEffect, useRef } from 'react';
import '../styles.css';
import '../api-utils';
import * as XLSX from 'xlsx'; // Importar SheetJS

function PorPagar() {
    const [COA, setCOA] = useState('');
    const [resultados, setResultados] = useState([]);
    const [pendiente, setPendiente] = useState(null);
    const [cantidadResultados, setCantidadResultados] = useState('');
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const dropdownRef = useRef(null);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
        "Julio", "Agosto","Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    const monthMap = {
        "Enero": "01", "Febrero": "02", "Marzo": "03", "Abril": "04", "Mayo": "05", "Junio": "06",
        "Julio": "07", "Agosto": "08", "Septiembre": "09", "Octubre": "10", "Noviembre": "11", "Diciembre": "12"
    }

    useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false); // Cierra el dropdown
                }
            };
    
            // Agrega el detector de eventos
            document.addEventListener("mousedown", handleClickOutside);
    
            // Limpia el detector de eventos al desmontar el componente
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, []);

    const handleCheckboxChange = (month) => {
        if (selectedMonths.includes(month)) {
            setSelectedMonths(selectedMonths.filter(m => m !== month));
        } else {
            setSelectedMonths([...selectedMonths, month]);
    }}

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    }

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
                const aStatus = aValue === 'C' ? 1 : 0; // CANCELADO = 1, PENDIENTE = 0
                const bStatus = bValue === 'C' ? 1 : 0; // CANCELADO = 1, PENDIENTE = 0

                if (direction === 'asc') {
                    return aStatus - bStatus; // PENDIENTE primero
                } else {
                    return bStatus - aStatus; // CANCELADO primero
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

    const buscarpendiente = async (coasToSearch = [COA]) => {
        if (!Array.isArray(coasToSearch)) {
            coasToSearch = [COA];
        }

        if (!coasToSearch || coasToSearch.length === 0 || coasToSearch.every(coa => !coa || coa === '.')) {
            setError('Por favor ingrese al menos un COA válido');
            alert("Por favor ingrese al menos un COA válido");
            return;
        }

        let allResults = [];
        setError('');

        try {
            for(const coa of coasToSearch) {
                let url = `/api/ctapagar?COA=${encodeURIComponent(coa.trim())}`;

                if (selectedYear) {
                    url += `&year=${selectedYear}`;
                }

                if(selectedMonths.length > 0){
                    selectedMonths.forEach(month => {
                        url += `&month=${monthMap[month]}`;
                    });
                }

                const response = await fetch(url);
                const data = await response.json();

                if (data.resultados && data.resultados.length > 0) {
                    allResults = [...allResults, ...data.resultados];
                }
            }

            if (allResults.length > 0) {
                setResultados(allResults);
                setCantidadResultados(<strong>Se encontró {allResults.length} resultado(s)</strong>);
            } else {
                setCantidadResultados('No se encontraron resultados para los COAs especificados');
                setResultados([]);
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al procesar la solicitud');
        }
    };

    const calcularpendiente = async () => {
        if (!COA || COA === '.' || COA.length === 0) {
            setError('Por favor ingrese un COA válido');
            alert("Por favor ingrese un COA válido");
            return;
        }

        const params = {};
        if (COA) params.COA = COA;

        try {
            const data = await window.API.pendiente(params);

            if (data.length > 0) {
                setPendiente(data[0]);
                setError('');
            } else {
                setPendiente(null);
                setError('No se encontraron resultados para el COA especificado');
            }
        } catch (error) {
            console.error('Error al calcular la deuda:', error);
            setError('Error al procesar la solicitud');
        }
    };

    const limpiar = () => {
        setCOA('');
        setResultados([]);
        setPendiente(null);
        setCantidadResultados('');
        setError('');
        setSelectedMonths([]);
        setSelectedYear(null);
    };

    const exportToExcel = () => {
        if (resultados.length === 0 && !pendiente) {
            alert('No hay datos para exportar.');
            return;
        }

        // Crear un libro de trabajo
        const wb = XLSX.utils.book_new();

        // Exportar la tabla de "pendiente" (si existe)
        if (pendiente) {
            const pendienteData = [
                {
                    'COA': pendiente._id || '-',
                    'Total Cargo': `S/ ${pendiente.totalCARGO || '-'}`,
                    'Total Abono': `S/ ${pendiente.totalABONO || '-'}`,
                    'Pendiente': `S/ ${pendiente.pendiente || '-'}`,
                }
            ];
            const wsPendiente = XLSX.utils.json_to_sheet(pendienteData);
            XLSX.utils.book_append_sheet(wb, wsPendiente, 'Resumen Pendiente');
        }

        // Exportar la tabla de "resultados" (si existe)
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

        // Generar y descargar el archivo .xlsx
        const date = new Date().toLocaleDateString().replace(/\//g, '-');
        XLSX.writeFile(wb, `cuentas_por_pagar_${date}.xlsx`);
    };

    return (
        <div className="container">
            <h1 className="text-center mb-4" style={{ fontFamily: 'Poppins' }}>
                CUENTAS POR PAGAR LANCASTER S.A
            </h1>

            <div className="row g-3 mb-4">
                <div className="col-12 col-md-12">
                    <div style={{display:'flex'}} >
                    <input
                        type="text"
                        className="form-control"
                        id="COA"
                        placeholder="Ingrese el COA del proveedor"
                        style={{ fontFamily: 'Rubik' }}
                        value={COA}
                        onChange={(e) => setCOA(e.target.value)}
                    />
                    <br/>
                    <select class="form-select" aria-label="Default select example"
                    onChange={(e) => setSelectedYear(e.target.value)}
                    value={selectedYear || ""}
                    style={{ fontFamily: 'Rubik' }}>
                        <option value="">Seleccione el año</option>
                        {(() => {
                            let years = [];
                            for (let year = 2025; year >= 2000; year--) {
                                years.push(<option key={year} value={year}>{year}</option>);
                            }
                            return years
                            })()};
                    </select>
                    </div>
                    <br/>
                    <div className="dropdown" ref={dropdownRef}>
                        <button className="btn btn-secondary dropdown-toggle"
                                type="button" onClick={toggleDropdown} style={{ fontFamily: 'Rubik' }}>
                                Seleccione el mes
                        </button>
                        <div className={`dropdown-menu ${isOpen ? "show" : ""}`} style={{fontFamily: 'Rubik'}}>
                            <div style={{marginLeft: '6px'}}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                />
                                <label>Seleccionar todos</label>
                            </div>
                            {months.map((month, index) => (
                                <div key={index} className="dropdown-item" style={{ padding: 0 }}>
                                    <label htmlFor={`check-${month}`} style={{ display: 'block', width: '100%', padding: '0.25rem 1.5rem', cursor: 'pointer' }}>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`check-${month}`}
                                                checked={selectedMonths.includes(month)}
                                                onChange={() => handleCheckboxChange(month)}
                                            />
                                            <span className="form-check-label">
                                                {month}
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>        
                </div>
            </div>

            <div className="row g-3 mb-5">
                <div className="col-12 col-md-4">
                    <button className="btn btn-secondary btn-lg w-100" style={{ fontFamily: 'Rubik' }} onClick={buscarpendiente}>Buscar</button>
                </div>
                <div className="col-12 col-md-4">
                    <button className="btn btn-primary btn-lg w-100" style={{ fontFamily: 'Rubik' }} onClick={calcularpendiente}>Calcular Deuda</button>
                </div>
                <div className="col-12 col-md-4">
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

            {error && <div className="alert alert-danger">{error}</div>}

            {pendiente && (
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

            {cantidadResultados && <p className="text-muted">{cantidadResultados}</p>}

            {resultados.length > 0 && (
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
        </div>
    );
}
export default PorPagar;