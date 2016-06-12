var config = require('./config.json');
var Twitter = require('twitter');

function DeleteTrump(api) {
  this.client = new Twitter(api);
}

DeleteTrump.prototype = {
  startStream: function() {
    var self = this;
    this.client.stream('statuses/filter', {
      'follow': '25073877'
    }, function (stream) {
      console.log('STARTING DYA STREAM .... ');
      self.stream = stream;
      stream.on('data', function (tweet) {
        // only reply to tweets _from_ user
        if (!tweet.user || tweet.user.screen_name !== 'realDonaldTrump') return;

        self.client.post('statuses/update', {
          'in_reply_to_status_id': tweet.id_str,
          status: '.@realDonaldTrump Delete your account.'
        }, function (err) {
          if (err) handleError(err);

          console.log('REPLIED TO TRUMP\'s TWEET ', tweet.text);
          console.log('');
        });
      });

      stream.on('error', self.handleError.bind(self));
      stream.on('end', self.resurrect.bind(self));
    });
  },

  resurrect: function() {
    this.stream = null
    var self = this;
    console.log('RESURRECTING STREAM');
    setTimeout(function() {
      self.startStream();
    }, 1000 * 60 * 5 ); // wait 5 minutes
  },

  handleError: function(err) {
    console.log(err);
    process.exit();
  }
}

var deleteTrump = new DeleteTrump(config.api);
deleteTrump.startStream();
