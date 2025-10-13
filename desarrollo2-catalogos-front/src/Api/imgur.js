// --- INICIO DE BLOQUE AÑADIDO ---

// ID de cliente de Imgur. Puedes usar este o registrar tu propia aplicación en api.imgur.com
const IMGUR_CLIENT_ID = "5822c2a00350819";

/**
 * Sube una imagen a Imgur y devuelve la URL.
 * @param {File} file El archivo de imagen a subir.
 * @returns {Promise<string>} La URL de la imagen subida.
 */
export const uploadImageToImgur = async (file) => {
  if (!file) throw new Error("No se proporcionó un archivo para subir.");

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        // No se necesita 'Content-Type'
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.data.error || "Error al subir la imagen a Imgur.");
    }

    // Devolvemos el link de la imagen
    return data.data.link;
  } catch (error) {
    console.error("Error en uploadImageToImgur:", error.message);
    throw error;
  }
};
// ... (toda la lógica de la función) ...

export default uploadImageToImgur; // <-- Asegúrate de que use "export default"