require("dotenv").config();
const File = require("../model/File");
const JSZip = require("jszip");
const cloudinary = require("cloudinary").v2;
const { PassThrough } = require("stream"); // For streaming the response
const https = require("https");

const imageCtrl = {
  uploadFile: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const fileSavePromises = req.files.map((f) =>
        File.create({
          ip: req.ip,
          path: f.path, // Cloud URL
          type: f.mimetype,
          name: f.filename, // Public_id
          originalname: f.originalname,
        })
      );

      await Promise.all(fileSavePromises);

      // Respond with a success message
      res.json({ message: "Images uploaded successfully" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },
  getFiles: async (req, res) => {
    try {
      const files = await File.find({ ip: req.ip });

      const filesToDelete = files.filter((file) => {
        return Math.floor((Date.now() - file.createAt) / (1000 * 60)) > 29;
      });

      for (const file of filesToDelete) {
        await File.findByIdAndDelete(file._id);
      }

      const remainingFiles = files.filter(
        (file) => !filesToDelete.includes(file)
      );

      return res.status(200).json({ files: remainingFiles });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  deleteAll: async (req, res) => {
    try {
      const files = await File.find({ ip: req.ip });

      const deletePromises = files.map(async (file) => {
        await cloudinary.uploader.destroy(file.name);
        await File.findByIdAndDelete(file._id);
      });

      await Promise.all(deletePromises);

      return res.status(200).json({ msg: "Deleted all files" });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  deleteSingle: async (req, res) => {
    const { filenames } = req.body;
    try {
      const deletePromises = filenames.map(async (file) => {
        await cloudinary.uploader.destroy(file.name);
        await File.findByIdAndDelete(file._id);
      });

      await Promise.all(deletePromises);

      return res.status(200).json({ msg: "Deleted Files" });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  downloadAll: async (req, res) => {
    const { filenames } = req.body;
    const zip = new JSZip();

    try {
      const downloadPromises = filenames.map((file) => {
        return new Promise((resolve, reject) => {
          const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/image/upload/${file.name}`;

          https.get(cloudinaryUrl, (response) => {
            if (response.statusCode !== 200) {
              return reject(
                new Error(
                  `Failed to get '${cloudinaryUrl}' (${response.statusCode})`
                )
              );
            }

            const stream = new PassThrough();
            response.pipe(stream); // Pipe the response into the PassThrough stream

            // Add the streamed data to the ZIP file
            zip.file(file.originalname, stream);

            // Resolve the promise when the stream finishes
            response.on("end", resolve);
            response.on("error", reject);
          });
        });
      });

      // Wait for all download promises to resolve
      await Promise.all(downloadPromises);

      // Generate the ZIP file
      const zipData = await zip.generateAsync({ type: "nodebuffer" });

      // Set response headers for the ZIP file download
      res.set("Content-Disposition", 'attachment; filename="files.zip"');
      res.set("Content-Type", "application/zip");
      res.status(200).send(zipData);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ msg: "Error downloading files" });
    }
  },
};

module.exports = imageCtrl;
