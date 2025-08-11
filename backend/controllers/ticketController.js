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

// Add Ticket Function
const addTicket = async (req, res) => {
    const {title, description, deadline} = req.body;
    try{
        const Ticket = await Ticket.create({userId: req.user.id, title, description, deadline});
        res.status(201).json(Ticket);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};


module.exports = {getTickets, addTicket};


