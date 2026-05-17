const express = require("express")
const router = express.Router();
const eventController = require('../controller/eventController')


router.get('/:uniqueLink' ,eventController.view_event_get );
router.post('/:uniqueLink/select' , eventController.select_photos_post );

module.exports = router