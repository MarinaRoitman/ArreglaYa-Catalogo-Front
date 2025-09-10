import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage';

describe('RegisterPage', () => {
  test('renderiza todos los campos de entrada', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // placeholders tal cual aparecen en tu DOM
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apellido')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mail')).toBeInTheDocument();        // ← era "Email"
    expect(screen.getByPlaceholderText('Teléfono')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Dirección')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Usuario')).toBeInTheDocument();     // ← existe
    // Select de zona (no tiene placeholder, validamos que esté y tenga la opción default)
    const selectZona = screen.getByRole('combobox');
    expect(selectZona).toBeInTheDocument();
    expect(within(selectZona).getByRole('option', { name: /Seleccione una zona/i })).toBeInTheDocument();
    // Passwords
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repita la Contraseña')).toBeInTheDocument();
  });

  test('permite completar el formulario (sin enviar)', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Martina' } });
    fireEvent.change(screen.getByPlaceholderText('Apellido'), { target: { value: 'Lopez' } });
    fireEvent.change(screen.getByPlaceholderText('Mail'), { target: { value: 'marti@mail.com' } });
    fireEvent.change(screen.getByPlaceholderText('Teléfono'), { target: { value: '1122334455' } });
    fireEvent.change(screen.getByPlaceholderText('Dirección'), { target: { value: 'Calle Falsa 123' } });
    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'mlu' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'Secreta123' } });
    fireEvent.change(screen.getByPlaceholderText('Repita la Contraseña'), { target: { value: 'Secreta123' } });

    expect(screen.getByPlaceholderText('Nombre')).toHaveValue('Martina');
    expect(screen.getByPlaceholderText('Apellido')).toHaveValue('Lopez');
    expect(screen.getByPlaceholderText('Mail')).toHaveValue('marti@mail.com');
    expect(screen.getByPlaceholderText('Teléfono')).toHaveValue('1122334455');
    expect(screen.getByPlaceholderText('Dirección')).toHaveValue('Calle Falsa 123');
    expect(screen.getByPlaceholderText('Usuario')).toHaveValue('mlu');
    expect(screen.getByPlaceholderText('Contraseña')).toHaveValue('Secreta123');
    expect(screen.getByPlaceholderText('Repita la Contraseña')).toHaveValue('Secreta123');

    // no tocamos el select ni hacemos submit para evitar dependencias de API o validaciones
  });
});
