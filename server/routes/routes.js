const router = require("express").Router();
const upload = require("../middleware/upload");
const imageCtrl = require("../controllers/imageCtrl");
const cloudinary = require("cloudinary");

router.post("/upload", upload.array("files"), imageCtrl.uploadFile);
router.get("/get", imageCtrl.getFiles);
router.post("/downloadall", imageCtrl.downloadAll);
router.delete("/deleteAll", imageCtrl.deleteAll);
router.post("/delete", imageCtrl.deleteSingle);

module.exports = router;
