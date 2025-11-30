import { Modal, Text, Button, Group } from "@mantine/core";

export default function ModalReprocesarEventos({ opened, onClose, message }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title={<Text fw={700}>Re-procesar Eventos</Text>}
    >
      <Text mb="md" ta="center">{message}</Text>

      <Group justify="center" mt="md">
        <Button color="#b67747ff" onClick={onClose}>
          Aceptar
        </Button>
      </Group>
    </Modal>
  );
}
