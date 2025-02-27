const { logError } = require('./loggerService');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
    try {
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: 'image',
        });

        fs.unlinkSync(filePath);
        return response.url;
    } catch (error) {
        logError(error);
        return null;
    }
};

module.exports = uploadOnCloudinary;
