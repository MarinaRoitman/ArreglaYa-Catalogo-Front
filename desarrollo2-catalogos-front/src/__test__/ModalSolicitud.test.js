import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test.utils'; // Usamos el render custom
import ModalSolicitud from '../components/ModalSolicitud';

// CORREGIDO: El objeto de prueba ahora usa `servicio` en lugar de `habilidad` 
// y no necesita el nombre del cliente, ya que el componente no lo usa.
const sampleJob = {
  id: 1,
  servicio: 'Reparación de cañerías', 
};

describe('ModalSolicitud', () => {
  it('renderiza con los datos del trabajo y los botones', () => {
    render(<ModalSolicitud opened={true} job={sampleJob} />);

    // Verificamos que se muestre el título y el servicio
    expect(screen.getByRole('heading', { name: /Confirmar Solicitud/i })).toBeInTheDocument();
    expect(screen.getByText(/"Reparación de cañerías"/i)).toBeInTheDocument();
    
    // CORREGIDO: Eliminamos la siguiente línea porque el componente ya no muestra el nombre del cliente.
    // expect(screen.getByText(/Cliente: Cliente de Prueba/i)).toBeInTheDocument();

    // Verificamos que los botones principales estén presentes
    expect(screen.getByRole('button', { name: /Enviar Presupuesto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('llama a onSubmit con los datos del formulario', async () => {
    const handleSubmit = jest.fn();
    const handleClose = jest.fn();
    
    render(<ModalSolicitud opened={true} job={sampleJob} onSubmit={handleSubmit} onClose={handleClose} />);

    // CORREGIDO: Buscamos el input por la etiqueta "Costo Total", no "Costo Total del Trabajo".
    const montoInput = screen.getByLabelText(/Costo Total/i);
    fireEvent.change(montoInput, { target: { value: '5000' } });

    fireEvent.click(screen.getByRole('button', { name: /Enviar Presupuesto/i }));

    // CORREGIDO: Verificamos que se envíen los datos correctos.
    // El componente envía la fecha como un string ISO, por lo que `expect.any(String)` es correcto.
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: sampleJob.id,
          montoTotal: 5000,
          fecha: expect.any(String), 
        })
      );
    });

    // Verificamos que el modal se cierra al hacer submit
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});