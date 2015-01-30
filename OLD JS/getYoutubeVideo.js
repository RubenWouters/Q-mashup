
//________________ YOUTUBE API ________________

var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      var player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          height: '490',
          width: '880',
          videoId: artistID,
          playerVars: { controls: 0, showinfo: 0, rel: 0, showsearch: 0, iv_load_policy: 3 },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': catchError
          }
        });
      }
      
      function onPlayerReady(event) {
          event.target.playVideo();
      }

      var done = false;
      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
          // setTimeout(stopVideo, 6000);
          done = true;
        }
        if(event.data == YT.PlayerState.ENDED)
        {
          location.reload();
        }
      }

      function catchError(event)
      {
        if(event.data == 100) console.log("De video bestaat niet meer");
      }

      function stopVideo() {
        player.stopVideo();
      }