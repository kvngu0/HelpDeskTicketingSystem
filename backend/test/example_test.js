

const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Ticket = require('../models/Ticket');
const { updateTicket,getTickets,addTicket,deleteTicket } = require('../controllers/ticketController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;


describe('AddTicket Function Test', () => {

  it('should create a new Ticket successfully', async () => {
    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "New Ticket", description: "Ticket description", deadline: "2025-12-31" }
    };

    // Mock Ticket that would be created
    const createdTicket = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

    // Stub Ticket.create to return the createdTicket
    const createStub = sinon.stub(Ticket, 'create').resolves(createdTicket);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addTicket(req, res);

    // Assertions
    expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdTicket)).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Ticket.create to throw an error
    const createStub = sinon.stub(Ticket, 'create').throws(new Error('DB Error'));

    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "New Ticket", description: "Ticket description", deadline: "2025-12-31" }
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addTicket(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

});


describe('Update Function Test', () => {

  it('should update Ticket successfully', async () => {
    // Mock Ticket data
    const TicketId = new mongoose.Types.ObjectId();
    const existingTicket = {
      _id: TicketId,
      title: "Old Ticket",
      description: "Old Description",
      completed: false,
      deadline: new Date(),
      save: sinon.stub().resolvesThis(), // Mock save method
    };
    // Stub Ticket.findById to return mock Ticket
    const findByIdStub = sinon.stub(Ticket, 'findById').resolves(existingTicket);

    // Mock request & response
    const req = {
      params: { id: TicketId },
      body: { title: "New Ticket", completed: true }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    // Call function
    await updateTicket(req, res);

    // Assertions
    expect(existingTicket.title).to.equal("New Ticket");
    expect(existingTicket.completed).to.equal(true);
    expect(res.status.called).to.be.false; // No error status should be set
    expect(res.json.calledOnce).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });



  it('should return 404 if Ticket is not found', async () => {
    const findByIdStub = sinon.stub(Ticket, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateTicket(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Ticket not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(Ticket, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateTicket(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;

    findByIdStub.restore();
  });



});



describe('GetTicket Function Test', () => {

  it('should return Tickets for the given user', async () => {
    // Mock user ID
    const userId = new mongoose.Types.ObjectId();

    // Mock Ticket data
    const Tickets = [
      { _id: new mongoose.Types.ObjectId(), title: "Ticket 1", userId },
      { _id: new mongoose.Types.ObjectId(), title: "Ticket 2", userId }
    ];

    // Stub Ticket.find to return mock Tickets
    const findStub = sinon.stub(Ticket, 'find').resolves(Tickets);

    // Mock request & response
    const req = { user: { id: userId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getTickets(req, res);

    // Assertions
    expect(findStub.calledOnceWith({ userId })).to.be.true;
    expect(res.json.calledWith(Tickets)).to.be.true;
    expect(res.status.called).to.be.false; // No error status should be set

    // Restore stubbed methods
    findStub.restore();
  });

  it('should return 500 on error', async () => {
    // Stub Ticket.find to throw an error
    const findStub = sinon.stub(Ticket, 'find').throws(new Error('DB Error'));

    // Mock request & response
    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getTickets(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findStub.restore();
  });

});



describe('DeleteTicket Function Test', () => {

  it('should delete a Ticket successfully', async () => {
    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock Ticket found in the database
    const Ticket = { remove: sinon.stub().resolves() };

    // Stub Ticket.findById to return the mock Ticket
    const findByIdStub = sinon.stub(Ticket, 'findById').resolves(Ticket);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteTicket(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(Ticket.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Ticket deleted' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 404 if Ticket is not found', async () => {
    // Stub Ticket.findById to return null
    const findByIdStub = sinon.stub(Ticket, 'findById').resolves(null);

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteTicket(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Ticket not found' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Ticket.findById to throw an error
    const findByIdStub = sinon.stub(Ticket, 'findById').throws(new Error('DB Error'));

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteTicket(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

});
