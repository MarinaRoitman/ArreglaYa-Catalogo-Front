// src/components/ModalCambiarContrasena.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Stack, PasswordInput, Button, Group, Alert } from '@mantine/core';

// Asegúrate de que "export default" esté aquí
export default function ModalCambiarContrasena({ opened, onClose, onSubmit, loading, error, clearError }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [matchError, setMatchError] = useState(false);

  useEffect(() => {
    if (!opened) {
      setNewPassword('');
      setConfirmPassword('');
      setMatchError(false);
      clearError?.();
    }
  }, [opened, clearError]);

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      setMatchError(true);
      return;
    }
    setMatchError(false);
    onSubmit(newPassword);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Cambiar Contraseña" centered>
      <Stack>
        {error && <Alert color="red" title="Error al guardar">{error}</Alert>}
        {matchError && <Alert color="red" title="Error de validación">Las contraseñas no coinciden.</Alert>}
        
        <PasswordInput
          label="Nueva Contraseña"
          placeholder="Ingresá tu nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.currentTarget.value)}
          required
        />
        <PasswordInput
          label="Confirmar Nueva Contraseña"
          placeholder="Repetí la nueva contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          required
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            color="#93755E"
            onClick={handleSubmit}
            loading={loading}
            disabled={!newPassword || !confirmPassword}
          >
            Guardar Cambios
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}