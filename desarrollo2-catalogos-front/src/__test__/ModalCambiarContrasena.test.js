import React from 'react';
import { render, screen, fireEvent } from '../test.utils';
import ModalCambiarContrasena from '../components/ModalCambiarContrasena';

describe('ModalCambiarContrasena', () => {
  it('debe renderizar el título y los campos principales', () => {
    render(<ModalCambiarContrasena opened={true} />);

    expect(screen.getByText('Cambiar Contraseña')).toBeInTheDocument();
    // SOLUCIÓN 3: Se busca por placeholder, que es único para cada campo y no da error.
    expect(screen.getByPlaceholderText('Ingresá tu nueva contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repetí la nueva contraseña')).toBeInTheDocument();
  });

  it('debe habilitar el botón de guardar solo cuando ambos campos están llenos', () => {
    render(<ModalCambiarContrasena opened={true} />);

    const newPasswordField = screen.getByPlaceholderText('Ingresá tu nueva contraseña');
    const confirmPasswordField = screen.getByPlaceholderText('Repetí la nueva contraseña');
    const saveButton = screen.getByRole('button', { name: /Guardar Cambios/i });

    fireEvent.change(newPasswordField, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordField, { target: { value: 'password123' } });

    expect(saveButton).not.toBeDisabled();
  });

  it('debe llamar a onSubmit con la contraseña correcta cuando coinciden', () => {
    const handleSubmit = jest.fn();
    render(<ModalCambiarContrasena opened={true} onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Ingresá tu nueva contraseña'), { target: { value: 'nuevaPass' } });
    fireEvent.change(screen.getByPlaceholderText('Repetí la nueva contraseña'), { target: { value: 'nuevaPass' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    expect(handleSubmit).toHaveBeenCalledWith('nuevaPass');
  });
});