var getPlayingSong = function(addToHTML)
{
	// ("#songName").empty();
	


	var $titleSong = $("#songName");
		$.ajax({
			dataType: "jsonp",
			url: "http://api.q-music.be/1.2/tracks/plays?limit=2?callback=?",
			success: function(playingSongs)
			{
				if(addToHTML)
				{
					$titleSong.append("<p> Titel: " + playingSongs.played_tracks[0].title
						 + "<br>" + "  Artist: " +  playingSongs.played_tracks[0].artist.name 
						 +"</p>");
				}
				artistID = playingSongs.played_tracks[0].videos.id;
				songName = playingSongs.played_tracks[0].title;
				artistName = playingSongs.played_tracks[0].artist.name;
			}
		});
		prevArtistID = artistID;
}












// $.each(playingSongs.played_tracks, function(i, song)
			// {
			// 	$titleSong.append("<p> Titel: " + song.title + "<br>" 
			// 		+ "  Artist: " +  song.artist.name +"</p>");

			// 	$artistID = song.videos.id;
   //      		if($artistID == undefined)
   //      		{
   //      		  $("#songName").append("Geen videoclip gevonden, wacht op het volgende liedje.");
   //      		}
			// })