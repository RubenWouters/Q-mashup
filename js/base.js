// WANNEER HET DOCUMENT KLAAR IS, WORDT DE SONG OPGEVRAAGD
$(document).ready(function()
{
	SONG.getSong();

	// SESSIONSTORAGE WORDT TERUG OPGEHAALD
	if(sessionStorage.getItem("totalSentiment") != undefined  )
	{
		var totalSentiment = sessionStorage.getItem("totalSentiment");
		totalSentiment = parseInt(totalSentiment);
		SENTIMENT.changeMeter(totalSentiment);
	}
});


// Als iemand op de Love-button klikt, worden de lyrics opgehaald
$("#submit").on("click", function()
{
	$(this).delay(400).queue(function()
	{
		$(this).addClass("clickedHeart");
		$(this).dequeue();
	});
	$("#submit").attr('disabled','disabled');

	LYRICS.getArtistID();
})


// SMOOTH SCROLLING
$('#smoothScroll').click(function(){
    $('html, body').animate({
        scrollTop: $( $(this).attr('href') ).offset().top
    }, 500);
    return false;
});
	

// _______________________________________ MODULES _______________________________________


// _____ HAALT SONG OP _____
var SONG = (function (my, $)
{
	// VARIABELEN
	var q,
		counter = 0,
		artistID,
		enableNext = false,
		songName,
		artistName;

		my.getSong = function()
		{
			q = Q.connect('qmusic_be');
			q.subscribe("plays")
				.on("play", function(track, msg)
				{	
					// ALS HET VOLGENDE LIEDJE BESCHIKBAAR IS MAG DIT INDIEN DE GEBRUIKER HET WENST GELADEN WORDEN
					// ANDERS (ALS HET LIEDJE VOOR DE 1E KEER GELADEN WORDT, MOET DE VIDEO GELADEN WORDEN)
					if(counter > 0)
					{
						$("#nextSong")
				  		.empty()
				  		.append("<button onClick='location.reload()' id='next'>Next song available > <br>"+ "<span class='bold'> " +  track.artist.name +  " -  " +    track.title +  "</span>" +"</a>")
				  		.hide()
				  		.slideDown();
				  		enableNext = true;
						VIDEO.newSong(enableNext);
				  		
					}
					else
					{
						addToHTML(track);
						VIDEO.loadPlayer();
					}
					counter++;

					artistID = track.youtube_id;
					songName = track.title;
					artistName = track.artist.name;

					
					
				}, {backlog:1}
			);
		}

		addToHTML = function(track)
		{
			$("#songName")
				.fadeOut()
				.empty()
				.append("<p class='bold'> " +  track.artist.name +  " -  " +    track.title +  "</p>")
				.fadeIn();
			
			$("#titleExtra").empty().append("Social corner of <span class='artistNameExtra'>" + track.artist.name + "</span>");
			
			if(track.artist.photo  != undefined) $("#photoArtist").empty().append("<img src='http://images.q-music.be" + track.artist.photo + "'>" );
			if(track.artist.country != undefined && track.artist.country.name != undefined) $("#country").empty().append("<div class='bold'>Country</div>" + track.artist.country.name);
			if(track.artist.website != undefined) $("#website").empty().append("<a target='_blank' href='" + track.artist.website + "'>" + "<img src='images/website.png'>" + "</a>");
			if(track.artist.twitter_url != undefined) $("#twitter").empty().append("<a target='_blank' href='" + track.artist.twitter_url + "'>" + "<img src='images/twitter.png'>" + "</a>");
			if(track.artist.facebook_url != undefined) $("#facebook").empty().append("<a target='_blank' href='" + track.artist.facebook_url + "'>" + "<img src='images/facebook.png'>" + "</a>");
			if(track.artist.bio != undefined) $("#test").empty().append("<div class='bold'>Info</div>" + track.artist.bio)
					.readmore({
					  speed: 750,
					  lessLink: '<a class="lessIsMore bold" href="#">Show less ^</a>',
					  moreLink: '<a class="lessIsMore bold" href="#">Read more v</a>',
					  blockCSS: 'display: inline-block; width: 100%;',
					  collapsedHeight: 210
					});
		}

	// DEZE FCTIES ZORGEN ERVOOR DAT DE LOKALE VARIABELEN TOCH BESCHIKBAAR ZIJN BUITEN DEZE SCOPE
	my.getArtistId = function()
	{
		return artistID;
	}
	my.getSongName = function()
	{
		return songName;
	}
	my.getArtistName = function()
	{
		return artistName;
	}

	return my;
}(SONG || {}, jQuery));

// _____ HAALT LYRICS OP _____
var LYRICS = (function (my, $)
{
	var trackID, 
		prepedText,
		preparedSongName,
		getArtistID;

	// HAALT HET ID OP VAN DE SONG
	my.getArtistID = function()
	{
		// ALLE SPATIES MOETEN UIT DE NAMEN OP DE API TE LATEN WERKEN
		preparedSongName = (SONG.getSongName()).replace(/\s/g,"%20");

		$.ajax({
		    dataType: "jsonp",
		    url: "http://api.musixmatch.com/ws/1.1/TRACK.SEARCH?apikey=6c50ea93e0fea41395963ba77bcb3ecf&q_artist=&q=" + preparedSongName + "&format=jsonp&callback",
		    success: function(json)
		    {
		    	try
		    	{
		      		trackID = (json.message.body.track_list[0].track.track_id);
		     	}
		      	catch(error)
		      	{
			      	$("#error").text("We couldn't get hold of the emotion of this song, we're sorry.");
			    }

		      	// ALS DE ID IS OPGEHAALD, LYRICS ZOEKEN
		      	$.ajax({
			    dataType: "jsonp",
			    url: "http://api.musixmatch.com/ws/1.1/TRACK.LYRICS.GET?apikey=6c50ea93e0fea41395963ba77bcb3ecf&track_id=" + trackID + "&format=jsonp&callback",
			    success: function(lyrics)
			    {
			    	try
			    	{
			    		text = lyrics.message.body.lyrics.lyrics_body;
				    	textWithoutEnter = text.replace(/(?:\r\n|\r|\n)/g, ' ');
				    	prepedText = textWithoutEnter.replace('...  ******* This Lyrics is NOT for Commercial use *******','');
				    	
				    	SENTIMENT.getSentiment();
			    	}
			    	catch(error)
			    	{
			    		$("#error").text("We couldn't get hold of the emotion of this song, we're sorry.");
			    	}
			    }})
		    }
		})
	}

	my.getPrepedText = function()
	{
		return prepedText;
	}

	return my;
}(LYRICS || {}, jQuery));

// _____ VERWERKT LYRICS _____
var SENTIMENT = (function (my, $)
{
	var sentiment, 
		getSentiment,
		i = 0,
		arSentiments = [],
		totalSentiment = 0;

	my.getSentiment = function()
	{
		$.ajax({
		  url: 'https://access.alchemyapi.com/calls/text/TextGetTextSentiment',
		  dataType: 'jsonp',
		  jsonp: 'jsonp',
		  type: "post",
		  data: { apikey: '9e017e7c37119e13db9942376d5dafa77a9c4c69', text: LYRICS.getPrepedText(), outputMode: 'json' },
		  success: function(sentiment){
	  		try
	  		{
	  			// VOOR ALS ER GEEN GETAL WORDT MEEGEGEVEN DOOR ALCHEMYAPI (EEN FOUT AAN HUN KANT)
	  			if(sentiment.docSentiment.score == null && sentiment.docSentiment.type != null)
	  			{
	  				if(sentiment.docSentiment.type == "neutral") addSentiment(0); 
	  				if(sentiment.docSentiment.type == "positive") addSentiment(10); 
	  				if(sentiment.docSentiment.type == "negative") addSentiment(-10); 
	  			}

	  			sentiment = Math.ceil((sentiment.docSentiment.score * 10));
		  		addSentiment(sentiment);
	  		}
	  		catch(error)
	  		{
	  			$("#error").text("We couldn't get hold of the emotion of this song, we're sorry.");
	  		}
		  }
		});
	}

	addSentiment = function(sentiment)
	{
		if(sessionStorage.getItem("arSentiments") != null)
		{
			// DE SESSIONSTORAGE GEEFT IPV DE ARRAY EEN STRING VERSIE TERUG, DUS MOET TERUG OMGEZET WORDEN
			arSentiments = sessionStorage.getItem("arSentiments").split(',').map(function(item) {
		    	return parseInt(item, 10);
			});	
			// ANDERS OVERSCHRIJFT HET DE ARRAY TELKENS
			i = arSentiments.length;
		}
		if(! isNaN(sentiment))
		{
			arSentiments[i] = sentiment;
			i++;
			
			for (var j = 0; j < arSentiments.length; j++) 
			{
				totalSentiment += arSentiments[j];
			};
			totalSentiment = Math.ceil((totalSentiment/arSentiments.length));
			my.changeMeter(totalSentiment);

			// SENTIMENT VALUE IN STORAGE STEKEN ZODAT HET NA REFRESH NOG TE BEREIKEN IS
			sessionStorage.setItem("totalSentiment", totalSentiment);
			sessionStorage.setItem("arSentiments", arSentiments);

			console.log(arSentiments);
			console.log("THIS SONG: " + sentiment);
			console.log("AVERAGE SENTIMENT: " + totalSentiment);
		}
	}

	my.changeMeter = function(totalSent)
	{

		var width = 0,
			color,
			text;

		switch(totalSent)
		{
			case +10:
				width = 100;
				color= '#4caf50';
				text = "super-cali-fragilistic-expiali-docious";
				break;
			case +9:
				width = 95;
				color= '#4caf50';
				text = "Awesome";
				break;
			case +8:
				width = 90.5;
				color= '#58b24a';
				text = "Very, very happy";
				break;
			case +7:
				width = 85.5;
				color= '#58b24a';
				text = "Feeling like superman!";
				break;
			case +6:
				width = 81;
				color= '#69b548';
				text = "Alive & kicking";
				break;
			case +5:
				width = 76;
				color= '#69b548';
				text = "I think I saw a unicorn!";
				break;
			case +4:
				width = 71.5;
				color= '#7cb846';
				text = "Like never before";
				break;
			case +3:
				width = 66.5;
				color= '#7cb846';
				text = "Like a fish in the water";
				break;
			case +2:
				width = 62;
				color= '#90bb44';
				text = "Full of life";
				break;
			case +1:
				width = 57;
				color= '#90bb44';
				text = "On the edge of smiling";
				break;
			case +0:
				width = 50;
				color= '#a6be42';
				text = "Somewhere in the middle..";
				break;
			case -1:
				width = 49.5;
				color= '#a6be42';
				text = "There is something on my mind";
				break;
			case -2:
				width = 47.5;
				color= '#bec13f';
				text = "Could be better";
				break;
			case -3:
				width = 42;
				color= '#bec13f';
				text = "Emotional";
				break;
			case -4:
				width = 38;
				color= '#c4b03d';
				text = "Gimmie a bar of chocolate!";
				break;
			case -5:
				width = 33.5;
				color= '#c4b03d';
				text = "Forget that bar of chocolate, give a BOX!";
				break;
			case -6:
				width = 28.5;
				color= '#c79a3a';
				text = "On the edge of crying";
				break;
			case -7:
				width = 23;
				color= '#c79a3a';
				text = "Need some tissues :'(";
				break;
			case -8:
				width = 19;
				color= '#ca8238';
				text = "Pretty bad";
				break;
			case -9:
				width = 14.5;
				color= '#ca8238';
				text = "Awful";
				break;
			case -10:
				width = 9.5;
				color= '#d32f2f';
				text = "Booo-hoo :(";
				break;
		}


		$("#feeling").text(text);
		$("#feeling").css('color', color);
		$("#progressbar > div ").css({
			'width': width + '%',
			'background-color': color,
			WebkitTransition : 'all 1s ease-in-out',
    		MozTransition    : 'all 1s ease-in-out',
    		MsTransition     : 'all 1s ease-in-out',
    		OTransition      : 'all 1s ease-in-out',
    		transition       : 'all 1s ease-in-out'}); 
	}

	return my;
}(SENTIMENT || {}, jQuery));

// _____ YOUTUBE VIDEO OPHALEN VAN SONG _____
var VIDEO = (function (my, $)
{	
	var player,
		newSong,
		error = false;

	my.loadPlayer = function() { 

	  if (typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined') {

	    var tag = document.createElement('script');
	  	tag.src = "https://www.youtube.com/iframe_api";
	    var firstScriptTag = document.getElementsByTagName('script')[0];
	  	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	    window.onYouTubePlayerAPIReady = function() {
	      onYouTubePlayer();
	    };
	  }
	}

	function onYouTubePlayer() {
	  player = new YT.Player('player', {
	    height: '490',
	    width: '890',
	    videoId: SONG.getArtistId(),
	    playerVars: { controls:0, showinfo: 0, rel: 0, showsearch: 0, iv_load_policy: 3 },
	    events: {
			'onReady': onPlayerReady,
	     	'onStateChange': onPlayerStateChange,
	      	'onError': catchError
	    }
	  });
	}

	  var done = false;
	  function onPlayerStateChange(event) {
	    if (event.data == YT.PlayerState.PLAYING && !done) {
	      // setTimeout(stopVideo, 6000);
	      done = true;
	    }
	    else if(event.data == YT.PlayerState.ENDED)
	    {
	      location.reload();
	    }
	  }

	  function onPlayerReady(event) {

	    event.target.playVideo();   
	  }
	  function catchError(event)
	  {
		if(event.data == 2) errorText = "Something went wrong, we're so sorry.";
		if(event.data == 100 ) errorText = "The video requested was not found. We're sorry!";
		if(event.data == 101 || event.data == 150) errorText = "The owner of the requested video does not allow it to be played in your country."
		
		error = true;

	    $("#error").empty().append(errorText + " <br> We'll be automatically refreshing the page when a new song starts");
	  }

	  my.newSong = function()
	  {
	  	if(error)
	  	{
	  		location.reload();
	  	}
	  }

	  function stopVideo() {
	    player.stopVideo();
	  }
		  
	return my;
}(VIDEO || {}, jQuery));