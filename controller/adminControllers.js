const Event = require('../models/eventModel')



// show admin dashboard
module.exports.dashboard_get = async(req , res)=>{
    try{
        const events = await Event.find({photographer:res.locals.user._id}).sort({eventDate:-1});
        res.render('admin/dashboard' , {title: 'Admin Dashboard' , events});
    }
    catch(err){
        console.log(err);
        res.redirect('/');      
    }
};

// event creation process form
module.exports.create_event_get = (req,res)=>{
    res.render('admin/create-event' , {title:'Create New Event'});
};

// event creation process form submit
module.exports.create_event_post = async (req,res)=>{
const {eventName , eventDate } = req.body;

const photographerId = res.locals.user._id;

try{
  const event = await Event.create({
    eventName,
    eventDate,
    photographer:photographerId
  })

  // PAGE AFTER CREATION OF EVENT GO TO THE EVENT DETAils page
  res.status(201).json({ redirect: `/admin/event/${event._id}` });
}
catch (err) {
        console.log(err);
        res.status(400).json({ error: "Event nahi ban paya." });
    }
};

// show perticular Event details 
module.exports.event_details_get = async (req ,res )=>{
    try{
        const event = await Event.findById(req.params.id);
        if(!event || event.photographer.toString() !== res.locals.user._id.toString()){
           return res.status(403).render('403', {title: 'Forbidden'});
        }
              res.render('admin/event-details', { title: event.eventName, event , req});
    }
    catch (err) { 
        console.log(err);
        res.status(404).render('404', {title: 'Not Found'});
    }

};


// photo upload logic
module.exports.upload_photo_post = async (req , res)=>{
    try{
        const event = await Event.findById(req.params.id);
        if(!event || event.photographer.toString() !== res.locals.user._id.toString()){
            return res.status(403).send("forbidden");
        }
        const filepaths = req.files.map(file => `/uploads/${file.filename}`);
        event.photos.push(...filepaths);
        await event.save();

        res.redirect(`/admin/event/${req.params.id}`);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

// show selected photos
module.exports.view_selections_get = async (req, res) => {
     try {
        const event = await Event.findById(req.params.id);
        if (!event || event.photographer.toString() !== res.locals.user._id.toString()) {
            return res.status(404).render('404', {title: 'Not Found'});
        }
        res.render('admin/view-selections', { title: `Selections for ${event.eventName}`, event , req });
    } catch (err) {
        console.log(err);
        res.status(404).render('404', {title: 'Not Found'});
    }
};

