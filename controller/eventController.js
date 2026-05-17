const Event = require('../models/eventModel');

// customer can see the event by uniqelink
module.exports.view_event_get =  async(req , res) =>{
    try{
        const event = await Event.findOne({ uniqueLink : req.params.uniqueLink});
        if(!event){
            return res.status(404).render('404' , {title : 'event not found'});  
        }
        res.render('customer/view-event' , { title : event.eventName , event});
    }
    catch(err){
      console.log(err)
      res.status(404).render('404', {title: 'Not Found'});
      
    }  
};

// save the customer selected photo

module.exports.select_photos_post = async (req , res)=>{
    const { selectedPhotos } = req.body;
    try{
        const event = await Event.findOne({uniqueLink : req.params.uniqueLink});
        if(!event){
            return res.status(404).json({ error: 'Event not found' });
        }
        //ensure the selected photos are Array
        const photoToSelect = Array.isArray(selectedPhotos) ? selectedPhotos : [selectedPhotos];
        event.selectedPhotos = photoToSelect ;
        await event.save();
        res.status(200).json({ message: 'Your photos have been successfully selected!', eventId: event._id });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
}