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
    <div>
      <h1 style={{ textAlign: 'center' }}>Mi Perfil</h1>
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
    </div>
  );
}

export default Perfil;
