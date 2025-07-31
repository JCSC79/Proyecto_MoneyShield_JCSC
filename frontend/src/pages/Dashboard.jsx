// src/pages/Dashboard.jsx

import { useEffect, useState } from 'react';
import '../styles/Form.css';
import '../styles/Dashboard.css';
import Alert from '../components/Alert';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardSummary, getExpensesByCategory, getRecentMovements } from '../services/movimientos.api';
import BudgetPieChart from '../components/BudgetPieChart';

function Dashboard() {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [cats, setCats] = useState([]);
  const [gastosRecientes, setGastosRecientes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDashboardSummary(),
      getExpensesByCategory(),
      getRecentMovements(5),
    ])
      .then(([summaryRes, catsRes, movs]) => {
        setSummary(summaryRes || {});
        setCats(Array.isArray(catsRes) ? catsRes : []);
        setGastosRecientes(Array.isArray(movs) ? movs : []);
      })
      .catch(() => setError('No se pudo cargar la información del dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Cargando dashboard...</p>;
  }
  if (error) {
    return <Alert type="error">{error}</Alert>;
  }
  if (!summary) {
    return <Alert type="error">No hay datos de dashboard</Alert>;
  }

  // Los KPIs principales, directo del backend
  const saldoActual = Number(summary.saldo_actual) ?? 0;
  const gastoMes = Number(summary.gasto_mes) ?? 0;
  const ingresoMes = Number(summary.ingreso_mes) ?? 0;
  const proyeccionMes = Number(summary.proyeccion_mes) ?? 0;
  const movimientosMes = Number(summary.movimientos_mes) ?? 0;
  const diasTranscurridos = Number(summary.dias_transcurridos) ?? 0;
  const diasMes = Number(summary.dias_mes) ?? 0;
  const presupuesto = user?.base_budget ? Number(user.base_budget) : 0;
  const porcUsado = presupuesto > 0 ? (gastoMes / presupuesto) * 100 : 0;
  const ahorroMes = Number(summary.ahorro_mes) ?? 0;
  const promedioDiario = diasTranscurridos ? gastoMes / diasTranscurridos : 0;

  return (
    <main className="dashboard-root">
      <h1 className="dashboard-title">Dashboard MoneyShield</h1>

      <section className="dashboard-kpis">
        <div className="dashboard-kpi dashboard-kpi-saldo">
          <div className="dashboard-kpi-title">Saldo actual</div>
          <div className="dashboard-kpi-value">
            {saldoActual.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€
          </div>
        </div>
        <div className="dashboard-kpi dashboard-kpi-gasto">
          <div className="dashboard-kpi-title">Gastos del mes</div>
          <div className="dashboard-kpi-value">
            {gastoMes.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€
          </div>
        </div>
        <div className="dashboard-kpi dashboard-kpi-presup">
          <div className="dashboard-kpi-title">% Presupuesto</div>
          <div
            className={
              "dashboard-kpi-value " +
              (porcUsado > 90 ? "error" : porcUsado > 75 ? "warn" : "ok")
            }
          >
            {presupuesto ? `${porcUsado.toFixed(0)}%` : "—"}
          </div>
        </div>
        <div className="dashboard-kpi dashboard-kpi-ahorro" style={{ background: "#e3faeb" }}>
          <div className="dashboard-kpi-title">Ahorro mes</div>
          <div className="dashboard-kpi-value" style={{ color: "#388e3c" }}>
            {ahorroMes.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </div>
        </div>
        <div className="dashboard-kpi dashboard-kpi-mov" style={{ background: "#eff2fc" }}>
          <div className="dashboard-kpi-title">Movimientos mes</div>
          <div className="dashboard-kpi-value" style={{ color: "#1976d2" }}>
            {movimientosMes}
          </div>
        </div>
        <div className="dashboard-kpi dashboard-kpi-prom" style={{ background: "#f2e4fa" }}>
          <div className="dashboard-kpi-title">Promedio diario</div>
          <div className="dashboard-kpi-value" style={{ color: "#a069c7" }}>
            {promedioDiario.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </div>
        </div>
      </section>

      {(presupuesto > 0) && (
        <section className="dashboard-card-section">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <BudgetPieChart used={gastoMes} total={presupuesto} />
          </div>
          <div style={{ textAlign: "center", color: "#1976d2", fontWeight: 600, marginTop: 8 }}>
            Presupuesto mensual usado
          </div>
          <div style={{ textAlign: "center", color: "#888", marginTop: 4 }}>
            <b>Proyección: </b>{proyeccionMes ? proyeccionMes.toLocaleString("es-ES", { minimumFractionDigits: 2 }) + "€" : "—"}
          </div>
        </section>
      )}

      {presupuesto > 0 && porcUsado >= 80 && (
        <Alert type={porcUsado >= 100 ? "error" : "warning"}>
          {porcUsado >= 100
            ? <>¡Has superado tu presupuesto mensual (<b>{presupuesto}€</b>)!</>
            : <>¡Atención! Has gastado el <b>{porcUsado.toFixed(0)}%</b> de tu presupuesto mensual (<b>{presupuesto}€</b>).</>
          }
        </Alert>
      )}

      <div className="dashboard-section-tip">
        💡 Consejo: Revisa los movimientos con gasto más alto este mes.
      </div>

      {/* Últimos movimientos (siempre visible) */}
      <h2 className="dashboard-mov-title">Últimos movimientos</h2>
      <ul className="gastos-lista">
        {Array.isArray(gastosRecientes) && gastosRecientes.length > 0 ? gastosRecientes.map(gasto => (
          <li
            key={gasto.id}
            className={`gasto-item ${gasto.type_id === 1 ? 'ingreso' : 'gasto'}`}
          >
            <div>
              <span className="gasto-descripcion">{gasto.description || '(Sin descripción)'}</span>
              <div className="gasto-categoria">{gasto.category_name || 'Sin categoría'}</div>
            </div>
            <span className="gasto-monto">
              {gasto.type_id === 1 ? '+' : '-'}
              {Number(gasto.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
            </span>
          </li>
        )) : (
          <li style={{ color: "#888", textAlign: "center", padding: "32px 0" }}>
            No hay movimientos registrados.
          </li>
        )}
      </ul>
      <button
        className="dashboard-fab"
        aria-label="Nuevo movimiento"
        title="Añadir movimiento"
        onClick={() => window.location.href = "/nuevo-movimiento"}
      >
        +
      </button>
    </main>
  );
}

export default Dashboard;
