const express = require("express")
const router = express.Router();
const {authRequire , checkRole} = require('../middleware/authMiddleware');
const adminController = require("../controller/adminControllers");
const upload =  require('../middleware/fileUploadsMiddleware');


 

router.get("/dashboard" , authRequire , checkRole('photographer') ,  adminController.dashboard_get)
router.get("/create-event" , authRequire , checkRole('photographer') ,  adminController.create_event_get)
router.post("/create-event" , authRequire , checkRole ('photographer'),  adminController.create_event_post)
router.get('/event/:id' , authRequire , checkRole('photographer') , adminController.event_details_get);
router.post('/event/:id/upload' , authRequire , checkRole('photographer'), upload.array('photos' ,100), adminController.upload_photo_post);
router.get('/event/:id/selections'  , authRequire ,  checkRole('photographer') , adminController.view_selections_get);

module.exports = router;
