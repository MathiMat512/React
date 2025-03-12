import React, { useState } from 'react';
import '../styles.css';

function PorPagar(){
    const [COA, setCOA] = useState('');
    const [resultados, setResultados] = useState([]);
    const [pendiente, setPendiente] = useState(null);
    const [cantidadResultados, setCantidadResultados] = useState('');
    const [error, setError] = useState('');

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

    const sortTableByColumn = (column, asc = true) => {
        const dirModifier = asc ? 1 : -1;
        const sortedRows = [...resultados].sort((a, b) => {
            const aColText = a[column];
            const bColText = b[column];
            return aColText > bColText ? (1 * dirModifier) : (-1 * dirModifier);
        });
        setResultados(sortedRows);
    };

    const buscarpendiente = async()=>{
        if (!COA || COA === '.' || COA.length === 0) {
            setError('Por favor ingrese un COA válido');
            alert("Por favor ingrese un COA válido");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/ctapagar?COA=${COA}`);
            const data = await response.json();

            if (response.ok && data.resultados) {
                const filteredResults = data.resultados;
                setResultados(filteredResults);
                setCantidadResultados(<strong>Se encontró {filteredResults.length} resultado(s)</strong>);
                setError('');
            } else {
                setCantidadResultados('No se encontraron resultados para el COA especificado');
                setResultados([]);
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al procesar la solicitud');
        }
    }

    const calcularpendiente = async () => {
        if (!COA || COA === '.' || COA.length === 0) {
            setError('Por favor ingrese un COA válido');
            alert("Por favor ingrese un COA válido");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/pendiente?COA=${COA}`);
            const data = await response.json();

            if (response.ok && data.length > 0) {
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
    };

    return (
        <div className="container">
            <h1 className="text-center mb-4" style={{ fontFamily: 'Poppins' }}>CUENTAS POR PAGAR LANCASTER S.A</h1>

            <div className="row g-3 mb-4">
                <div className="col-12 col-md-12">
                    <input
                        type="text"
                        className="form-control"
                        id="COA"
                        placeholder="Ingrese el COA del proveedor"
                        value={COA}
                        onChange={(e) => setCOA(e.target.value)}
                    />
                </div>
            </div>

            <div className="row g-3 mb-5">
                <div className="col-12 col-md-4">
                    <button className="btn btn-secondary btn-lg w-100" onClick={buscarpendiente}>Buscar</button>
                </div>
                <div className="col-12 col-md-4">
                    <button className="btn btn-primary btn-lg w-100" onClick={calcularpendiente}>Calcular Deuda</button>
                </div>
                <div className="col-12 col-md-4">
                    <button className="btn btn-danger btn-lg w-100" onClick={limpiar}>Limpiar Datos</button>
                </div>
            </div>

            <hr className="my-4" />

            <h2>Resultados:</h2>

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
                                <th onClick={() => sortTableByColumn('DOC_FCH')}>Fecha</th>
                                <th>Moneda</th>
                                <th>Cargo en S/.</th>
                                <th>Abono en S/.</th>
                                <th>Cargo en $</th>
                                <th>Abono en $</th>
                                <th onClick={() => sortTableByColumn('STAT_CANC')}>Estado</th>
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