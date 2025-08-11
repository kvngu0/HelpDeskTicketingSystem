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

// Update Ticket
const updateTicket = async (req, res) => {
    const {title, description, completed, deadline} = req.body;
    try{
        const Ticket = await Ticket.findById(req.params.Id);
        if (!Ticket)
            return res.status(404).json({message:'Ticket not found'});
        Ticket.title = title || title.Ticket;
        Ticket.description = description || Ticket.description;
        Ticket.completed = completed ?? Ticket.completed;
        Ticket.deadline = deadline || Ticket.deadline;

        const updatedTicket = await Ticket.save();
        res.json(updatedTicket);
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

// Delete Ticket
const deleteTicket = async(req, res) => {
    try{
        const Ticket = await Ticket.findById(req.params.id);
        if(!Ticket)
            return res.status(404).json({message: 'Ticket not found'});
        await Ticket.remove();
        res.json({message:'Ticket deleted'});
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

module.exports = {getTickets, addTicket, updateTicket, deleteTicket};


