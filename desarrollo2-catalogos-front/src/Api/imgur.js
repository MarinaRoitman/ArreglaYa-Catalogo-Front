// Contenido corregido y final para Api/imgur.js

const IMGUR_CLIENT_ID = "5822c2a00350819"; // RECUERDA: Lo ideal es que crees tu propio ID.

export const uploadImageToImgur = async (file) => {
  if (!file) {
    throw new Error("No se proporcionó un archivo para subir.");
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: formData,
      referrerPolicy: "no-referrer",
    });

    const data = await response.json();

    // --- MANEJO DE ERRORES MEJORADO ---
    if (!response.ok || !data.success) {
      // Esta línea ahora puede leer cualquier formato de error de Imgur sin romperse.
      const errorMessage = data?.data?.error || "Error de saturación al subir la imagen a Imgur.";
      throw new Error(errorMessage);
    }

    return data.data.link;
    
  } catch (error) {
    console.error("Error en uploadImageToImgur:", error);
    throw error;
  }
};