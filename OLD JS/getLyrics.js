var trackID; 
var lyrics;
var getArtistID = function()
{
	
	var preparedSongName = songName.replace(/\s/g,"%20");
	var preparedArtistName = artistName.replace(/\s/g,"%20");
	console.log(preparedSongName);
	console.log(preparedArtistName);

	$.ajax({
	    dataType: "jsonp",
	    url: "http://api.musixmatch.com/ws/1.1/TRACK.SEARCH?apikey=6c50ea93e0fea41395963ba77bcb3ecf&q_artist=" + preparedArtistName + "&q=" + preparedSongName + "&format=jsonp&callback",
	    success: function(json)
	    {
	      trackID = (json.message.body.track_list[0].track.track_id);
	      console.log("track id: " + trackID);
	      getLyricsByID();
	    }
	})
}

var getLyricsByID = function()
{
	$.ajax({
		    dataType: "jsonp",
		    url: "http://api.musixmatch.com/ws/1.1/TRACK.LYRICS.GET?apikey=6c50ea93e0fea41395963ba77bcb3ecf&track_id=" + trackID + "&format=jsonp&callback",
		    success: function(lyrics)
		    {
		    	lyrics = lyrics.message.body.lyrics.lyrics_body;
		    	console.log(lyrics);

		    	$("#lyrics").append(lyrics);
		      // $.each(playingSongs.message.body.lyrics.lyrics_body, function(i, song)
		      // {
		      //   $lyrics = song;
		      //   $("#lyrics").append($lyrics);
		      // })
		    }})
}