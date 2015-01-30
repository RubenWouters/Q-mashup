// ________________ Q-MUSIC API ________________
var $startPlaying = false;
var artistID; 
var prevArtistID;
var songName;
var artistName;

$(document).ready(function()
{
  $("#songName").load('getPlayingSong.js');
  getPlayingSong(true);
  refresh();
});

var refresh = function()
{ 
  console.log("opnieuw");
  getPlayingSong(false);
  setTimeout(function()
  {
    if(prevArtistID == artistID)
    {
      refresh();
      console.log("zelfde liedje");
    }
    else
    {
      console.log("nieuw liedje");
      refresh();
      $("#songName").fadeOut().empty();
      getPlayingSong(true);
      $("#songName").fadeIn();
      
    }
  }, 5000);
}


$("#submit").click(function()
{
  getArtistID();
  // console.log($lyrics);
})

var getArtistID = function()
{
  return artistID;
}