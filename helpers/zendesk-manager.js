var zendesk = require('node-zendesk');
var config  = require('./../config.json');

function ZendeskManager() {
    this.client = zendesk.createClient({
    username:  config.zendesk.username,
    token:     config.zendesk.token,
    remoteUri: config.zendesk.remoteUri,
  });
}

ZendeskManager.prototype.verifyLogin = function(callback) {

  this.client.users.me(function (err, req, result) {
    if (err || !result.verified) {
      callback && callback(new Error("Unable to authenticate with Zendesk"));
    }
    else {
      callback && callback();
    }
  });

  return this;
};

ZendeskManager.prototype.createTicketForError = function(options, callback) {

  if (!options || !options.error) {
    return callback && callback(new Error("No Error provided for Zendesk ticket creator."));
  }

    if (options.orderId == undefined || options.orderID == null) {
    options.orderID = "of Unknown ID";
  }


  var ticket = 
    {"ticket":
      {
        "subject":"[Order Processing Error] Unable to transfer Celery Order " + options.orderID + " to Whiplash", 
        "comment": 
          { 
            "body": "An order was received by the Whiplash Integration Server that was unable to be transferred to Whiplash's Server.\n\n Here is the stack dump:\n\n" + options.error.stack
          },
        "type" : "problem",
        "priority" : "high",
        "status" : "open",
        "tags" : ["whiplash-integration-server", "whiplash-integration-testing"]
      }
    }

  // An option for adding on any other tags or modifying defaults
  for (var property in options.extras) {
    ticket.ticket[property] = options.extras[property];
  }

  this.client.tickets.create(ticket,  function(err, req, result) {
    return callback && callback(err, result.id);
  });
}



module.exports = ZendeskManager;
