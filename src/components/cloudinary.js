import { Alert } from "react-native";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dn7deiyof/upload";
const UPLOAD_PRESET = "unsigned_profile_upload";

export const uploadImage = async (uri, folder = "") => {
  if (!uri) return null;

  try {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "image.jpg",
    });
    formData.append("upload_preset", UPLOAD_PRESET);
    if (folder) formData.append("folder", folder);

    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.secure_url) return data.secure_url;

    throw new Error("No se pudo obtener la URL de Cloudinary");
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    Alert.alert("Error", "No se pudo subir la imagen. Intenta de nuevo.");
    return null;
  }
};
