var express = require('express');
var request = require('request');
var async = require('async');
var router = express.Router();
var config = require('./../config.json');
var Manager = require('../helpers/zendesk-manager.js');
var zendeskManger = new Manager();
var cwGlue = require('celery-whiplash');

cwGlue.initWithKeys(config);

router.processNewOrder = function(req, res) {

  console.warn('Received incoming order', req.body);

  // Attempt to process the single order
  cwGlue.processSingleOrder(req.body.order.id)
  // If it works
  .then(function() {
    // Just add it to the logs
    console.warn("Processing complete for order", req.body.order.id);
    // Return 200
    res.send(200);
  })
  // If it didn't work
  .fail(function(err) {
    // Handle our error with Zendesk
    router.handleError(res, err, req.body.order);
  });
};

router.handleError = function(res, error, order) {
  if (error) {

    console.warn("Error sending order to Whiplash", error, order && order.id ? order.id : "Unknown order id", error.stack);

    // Send a response
    res.send(403);

    // TODO: Send the ticket to Zendesk
    zendeskManger.verifyLogin(function loggedIn(authError) {
      if (authError) {
        console.warn('Unable to authenticate with Zendesk', authError);
      }
      else {
        var options = {
          error : error,
          order : order.id,
        }
        zendeskManger.createTicketForError(options, function(err, createdTicket) {
          if (err) {
            console.warn("Unable to create ticket on Zendesk", err);
          }
          else {
            console.warn("Created ticket number ", createdTicket, " on Zendesk.");
          }
        })
      }
    });
    
    
    return 1;
  }
}


router.post('/new_order', router.processNewOrder);

module.exports = router;