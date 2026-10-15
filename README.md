clock website for our project. it shows the time and weather for ur location and the nasa picture of the day is the background

settings button on the top right has brightness (so u can leave it on as a display), 12h/24h and F/C. all the settings get saved in local storage

on the left theres the weather, a study timer with a bar that goes down while it runs, and a box u click to read about todays nasa picture. in there u can also switch to the pictures from the last 3 days

apis we used
timeapi.io for the time and timezone
open-meteo for the weather
nasa apod for the picture (the old api.nasa.gov one is broken rn it only gives the nasa logo lol so we used the new one from science.nasa.gov)

how they work together: ur location goes to the time api and the weather api. the time from the time api and the sunset/sunrise + clouds from the weather api make the line under the clock (like clouds might hide the stars tonight). the date from the time api picks which nasa picture to show

code is split into model.js view.js controller.js for the mvc part

to run it just open index.html and press allow for location

live site: http://aryy.me/Digital-Clock
