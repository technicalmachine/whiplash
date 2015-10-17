var Manager = require('../helpers/zendesk-manager');
var assert = require('assert');

describe('Logging into Zendesk', function(t) {
  it('should successfully log in to Zendesk', function(done) {
    var manager = new Manager();
    manager.verifyLogin( function verified(err) {
      assert.equal(err, null);
      done();
    });
  });
});

describe('Creating a Zendesk Ticket', function() {

  it('should add an extra tag onto a ticket', function(done) {
    var manager = new Manager();
    var options = {
      error : new Error("This is just a test. Please delete ticket now. Thanks!"),
      orderId : 0,
      extras : {
        tags : ['whiplash-integration-testing']
      }
    }
    manager.createTicketForError(options, function(err, ticketId) {
      assert.notEqual(ticketId, null);
      assert.equal(err, null);
      done();
    })
  });
  it('should create a ticket in Zendesk', function(done) {
    var manager = new Manager();
    var options = {
      error : new Error("This is just a test. Please delete ticket now. Thanks!"),
      orderId : 0,
      extras : {
        tags : ['whiplash-integration-testing']
      }
    }
    manager.createTicketForError(options, function(err, ticketId) {
      assert.equal(err, null);
      assert.equal(typeof ticketId, 'number');
      done();
    });
  });

  it('should return an error for not passing in an error to report', function() {
    var manager = new Manager();
    var options = {
      error : null,
      orderId : 0,
      extras : {
        tags : ['whiplash-integration-testing']
      }
    }
    manager.createTicketForError(options, function(err, ticketId) {
      assert.notEqual(err, null);
      assert.equal(ticketId, null);
    })
  });
});

