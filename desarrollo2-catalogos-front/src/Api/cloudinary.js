console.log("--- CLOUDINARY.JS CARGADO ---");
const CLOUD_NAME = "drylurjra"; 

const UPLOAD_PRESET = "arreglaya_unsigned";

/**
 * @param {File} file - 
 * @returns {Promise<string>} 
 */
export const uploadImageToCloudinary = async (file) => {
  if (!file) {
    throw new Error("No se proporcionó ningún archivo para subir.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || "Error al subir la imagen a Cloudinary.");
    }

    return data.secure_url;

  } catch (error) {
    console.error("Error en uploadImageToCloudinary:", error);
    throw new Error(error.message || "No se pudo conectar con el servicio de imágenes.");
  }
};