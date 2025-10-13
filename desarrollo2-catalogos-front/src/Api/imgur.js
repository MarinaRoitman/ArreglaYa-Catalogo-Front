// Contenido corregido y final para Api/imgur.js

const IMGUR_CLIENT_ID = "5822c2a00350819";

/**
 * Sube una imagen a Imgur y devuelve la URL.
 * @param {File} file El archivo de imagen a subir.
 * @returns {Promise<string>} La URL de la imagen subida.
 */
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
        // La cabecera de Authorization es la única necesaria.
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: formData,
      // --- LA SOLUCIÓN DEFINITIVA ESTÁ AQUÍ ---
      // Esta línea le dice al navegador que no envíe la cabecera "Referer",
      // lo que evita el bloqueo de seguridad de Imgur.
      referrerPolicy: "no-referrer",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // Usamos el mensaje de error que devuelve Imgur para más claridad.
      throw new Error(data.data.error || "Error al subir la imagen a Imgur.");
    }

    // Devolvemos el link de la imagen.
    return data.data.link;
    
  } catch (error) {
    console.error("Error en uploadImageToImgur:", error);
    // Relanzamos el error para que el componente que llama se entere.
    throw error;
  }
};