import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage';

const renderPage = () =>
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );

describe('RegisterPage', () => {
  test('renderiza los campos principales', () => {
    renderPage();

    // Campos siempre presentes
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apellido')).toBeInTheDocument();

    // Email o Mail (aceptamos ambos)
    const emailInput = screen.getByPlaceholderText(/mail|email/i);
    expect(emailInput).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Teléfono')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Dirección')).toBeInTheDocument();

    // DNI o Usuario (según versión del form)
    const dniOrUser =
      screen.queryByPlaceholderText(/dni/i) ||
      screen.queryByPlaceholderText(/usuario/i);
    expect(dniOrUser).toBeInTheDocument();

    // Select de zona si existe
    const zona = screen.queryByRole('combobox');
    if (zona) {
      expect(within(zona).getByRole('option', { name: /seleccione una zona/i }))
        .toBeInTheDocument();
    }

    // Passwords
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repita la Contraseña')).toBeInTheDocument();
  });

  test('permite completar el formulario (sin enviar)', () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Martina' } });
    fireEvent.change(screen.getByPlaceholderText('Apellido'), { target: { value: 'Lopez' } });

    const emailInput = screen.getByPlaceholderText(/mail|email/i);
    fireEvent.change(emailInput, { target: { value: 'marti@mail.com' } });

    fireEvent.change(screen.getByPlaceholderText('Teléfono'), { target: { value: '1122334455' } });
    fireEvent.change(screen.getByPlaceholderText('Dirección'), { target: { value: 'Calle Falsa 123' } });

    const dni = screen.queryByPlaceholderText(/dni/i);
    if (dni) {
      fireEvent.change(dni, { target: { value: '12345678' } });
      expect(dni).toHaveValue('12345678');
    }
    const usuario = screen.queryByPlaceholderText(/usuario/i);
    if (usuario) {
      fireEvent.change(usuario, { target: { value: 'mlu' } });
      expect(usuario).toHaveValue('mlu');
    }

    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'Secreta123' } });
    fireEvent.change(screen.getByPlaceholderText('Repita la Contraseña'), { target: { value: 'Secreta123' } });

    // asserts básicos
    expect(screen.getByPlaceholderText('Nombre')).toHaveValue('Martina');
    expect(screen.getByPlaceholderText('Apellido')).toHaveValue('Lopez');
    expect(emailInput).toHaveValue('marti@mail.com');
    expect(screen.getByPlaceholderText('Teléfono')).toHaveValue('1122334455');
    expect(screen.getByPlaceholderText('Dirección')).toHaveValue('Calle Falsa 123');
    expect(screen.getByPlaceholderText('Contraseña')).toHaveValue('Secreta123');
    expect(screen.getByPlaceholderText('Repita la Contraseña')).toHaveValue('Secreta123');

    // no hacemos submit para no depender de API/validaciones
  });
});
