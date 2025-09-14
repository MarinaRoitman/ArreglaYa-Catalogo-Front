import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import ModalSolicitud from '../components/ModalSolicitud';

const AllTheProviders = ({ children }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

const sampleJob = {
  id: 1,
  habilidad: 'Reparación de cañerías',
  nombre: 'Cliente de Prueba',
};

describe('ModalSolicitud', () => {
  it('renderiza con los datos del trabajo y los botones', () => {
    customRender(<ModalSolicitud opened={true} job={sampleJob} />);

    // Usamos `getByRole` para ser específicos con el título
    expect(screen.getByRole('heading', { name: /Enviar Presupuesto/i })).toBeInTheDocument();
    expect(screen.getByText(/"Reparación de cañerías"/i)).toBeInTheDocument();
    expect(screen.getByText(/Cliente de Prueba/i)).toBeInTheDocument();
  });

  it('llama a onSubmit con los datos del formulario', () => {
    const handleSubmit = jest.fn();
    const handleClose = jest.fn(); // Mock para la función onClose
    
    customRender(<ModalSolicitud opened={true} job={sampleJob} onSubmit={handleSubmit} onClose={handleClose} />);

    const montoInput = screen.getByPlaceholderText(/Ingresa el monto final/i);
    fireEvent.change(montoInput, { target: { value: '5000' } });

    // Usamos `getByRole` para seleccionar el botón correctamente
    fireEvent.click(screen.getByRole('button', { name: /Enviar Presupuesto/i }));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: sampleJob.id,
        montoTotal: 5000,
      })
    );
    // Verificamos que onClose también es llamada
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});