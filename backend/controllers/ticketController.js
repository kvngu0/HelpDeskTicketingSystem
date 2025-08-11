// Get Ticket Function (Read)

const Ticket = require('../models/Ticket')

const getTickets = async (req, res) => {

    try{
        const Tickets = await Ticket.find({userId: req.user.id});

        res.json(Tickets);S
    } catch(error){
        res.status(500).json({message: error.message});
    }
};



module.exports = {getTickets};


