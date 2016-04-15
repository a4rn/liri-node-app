var param = process.argv;
var request = require('request');
var fs = require('fs');
var default_song = "what's+my+age+again?";
var default_movie = "mr+nobody";

if (param.length > 2) {
  var task = param[2].toLowerCase();
  doTask(task);
} else {
  console.log('missing job parameter')
};

function doTask(task) {
  switch (task) {
    case 'my-tweets':
      doTwitter();
      break;
    case 'spotify-this-song':
      doSpotify()
      break;
    case 'movie-this':
      doMovie()
      break;
    case 'do-what-it-says':
      doRandom()
      break;
    default:
      console.log('invalid job parameter')
  }
}

function doSpotify() {
  var song = '';
  if (param.length === 3) {
    song = default_song
  } else {
    tmp = '';
    for (var i = 3; i < param.length; i++) {
      tmp = tmp + param[i] + '+';
    }
    song = '"' + tmp.substr(0, tmp.length - 1) + '"';
  }

  var query = 'https://api.spotify.com/v1/search?q=' + song + '&type=track';
  request(query, function(error, response, body) {
    var resp = JSON.parse(body)

    if (resp.tracks.items.length > 0) {
      console.log(resp)
      for (var i = 0; i < resp.tracks.items.length; i++) {
        var songdata =
          '---------------------------------------------------------------------' + '\n' +
          'Artist   : ' + resp.tracks.items[i].artists[0].name + '\n' +
          'Song Name: ' + resp.tracks.items[i].name + '\n' +
          'Spotify  : ' + resp.tracks.items[i].external_urls.spotify + '\n' +
          'Album    : ' + resp.tracks.items[i].album.name + '\n' +
          '---------------------------------------------------------------------' + '\n'
        console.log(songdata);
        doLogging(songdata);
      }
    } else {
      console.log('Song not found!')
    }
  })
}


function doMovie() {
  var movie = '';
  if (param.length === 3) {
    movie = default_movie;
  } else {
    for (var i = 3; i < param.length; i++) {
      movie = movie + param[i] + '+';
    }
  }

  var query = 'http://www.omdbapi.com/?t=' + movie + '&plot=short&tomatoes=true&r=json'
  request(query, function(error, response, body) {
    var data = JSON.parse(body)
    if (data.Response != 'False') {
      var moviedata =
        '---------------------------------------------------------------------' + '\n' +
        'Title   : ' + data.Title + '\n' +
        'Year    : ' + data.Year + '\n' +
        'Country : ' + data.Country + '\n' +
        'Language: ' + data.Language + '\n' +
        'Plot    : ' + data.Plot + '\n' +
        'Actors  : ' + data.Actors + '\n' +
        'IMDB Rating : ' + data.imdbRating + '\n' +
        'Rotten Tomatoes Rating: ' + data.tomatoRating + '\n' +
        'Rotten Tomatoes URL   : ' + data.tomatoURL + '\n' +
        '---------------------------------------------------------------------' + '\n'
      console.log(moviedata);
      doLogging(moviedata);
    } else {
      console.log(movie + data.Error)
    }
  })
}

function doRandom() {
  fs.readFile("./random.txt", "utf8", function(error, data) {
    if (!error) {
      var dataarr = data.split(',')
      param = ['', ''];
      if (dataarr[0] > '') {
        param.push(dataarr[0]);
      }
      if (dataarr[1] > '') {
        param.push(dataarr[1]);
      }
      doTask(dataarr[0]);
    }
  });
}


function doTwitter() {
  var key = require('./keys.js');
  var consumer_key = key.twitterKeys.consumer_key;
  var consumer_secret = key.twitterKeys.consumer_secret;
  var access_token_key = key.twitterKeys.access_token_key;
  var access_token_secret = key.twitterKeys.access_token_secret;

  var Twitter = require('twitter');

  var twitter = new Twitter({
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
    access_token_key: access_token_key,
    access_token_secret: access_token_secret
  });


  twitter.get('search/tweets', {
    q: '@reynicolas8',
    result_type: 'recent'
  }, function(error, data, response) {
    if (data.statuses.length > 0) {
      for (var i = 0; i < data.statuses.length; i++) {
        var twitdata =
          '---------------------------------------------------------------' + '\n' +
          'Created  : ' + data.statuses[i].created_at + '\n' +
          'Tweet    : ' + data.statuses[i].text + '\n'
        console.log(twitdata)
        doLogging(twitdata)
      }
    } else {
      console.log('No recent tweets')
    }
  })
}


function doLogging(data) {
  fs.appendFile('log.txt', data, 'utf8', function(error) {
    if (error) {
      console.log(error)
    }
  })
}