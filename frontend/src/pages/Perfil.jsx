// src/pages/Perfil.jsx

import '../styles/Form.css';
import Input from '../components/Input';
import Alert from '../components/Alert';
import { useAuth } from '../contexts/AuthContext';

function Perfil() {
  const { user } = useAuth();

  if (!user) {
    return <Alert type="error">No se pudo cargar el perfil.</Alert>;
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "none"
    }}>
      <section style={{ minWidth: 0, width: "100%", maxWidth: 410 }}>
        <h2 style={{
          textAlign: "center",
          color: "#1976d2",
          margin: "0 0 22px 0",
          fontWeight: 700,
          fontSize: "2rem"
        }}>
          Mi Perfil
        </h2>
        <form className="form-base" autoComplete="off">
          <Input
            label="Nombre"
            type="text"
            value={user.first_name}
            disabled
            placeholder="Nombre"
          />
          <Input
            label="Apellido"
            type="text"
            value={user.last_name}
            disabled
            placeholder="Apellido"
          />
          <Input
            label="Correo electrónico"
            type="email"
            value={user.email}
            disabled
            placeholder="Correo electrónico"
          />
          <Input
            label="Perfil"
            type="text"
            value={user.profile_id === 1 ? 'Admin' : 'Usuario'}
            disabled
            placeholder="Perfil"
          />
          <Input
            label="Presupuesto base"
            type="number"
            value={user.base_budget}
            disabled
            placeholder="Presupuesto base"
          />
          <Input
            label="Ahorro base"
            type="number"
            value={user.base_saving}
            disabled
            placeholder="Ahorro base"
          />
        </form>
      </section>
    </main>
  );
}

export default Perfil;
