import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImage = async (uid:string, image:string, folder:string) => {
  try {
    const response = await cloudinary.v2.uploader.upload(image, {
      folder,
      public_id: `${uid}`,
    });

    return {
      uploadId: response.public_id,
      uploadUrl: response.secure_url,
    };
  } catch (error) {
    return false;
  }
};

export const deleteImage = async (publicId:string, folder:string) => {
  try {
    await cloudinary.v2.uploader.destroy(`${folder}/${publicId}`);

    return true;
  } catch (error) {
    return false;
  }
};
