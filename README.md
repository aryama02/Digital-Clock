# Space Clock

Space Clock is a browser-based digital clock with a space-themed background. It
shows the current time, local weather, and NASA's picture of the day. We built
it as a small web development project to practice working with APIs, browser
features, and the MVC pattern.

Live site: [aryy.me/Digital-Clock](http://aryy.me/Digital-Clock/)

## What it does

- Shows the current date and time
- Supports both 12-hour and 24-hour formats
- Finds the user's approximate location
- Shows current weather for that location
- Supports Fahrenheit and Celsius
- Lets the user enter a different time zone
- Uses NASA's picture of the day as the background
- Includes a study timer based on the Pomodoro technique
- Remembers display preferences using browser local storage

## How we built it

The project uses plain HTML, CSS, and JavaScript. We kept the JavaScript
separated using a simple Model-View-Controller structure:

- `model.js` handles application data, API requests, saved preferences, and
  information about the weather, time zone, and NASA picture.
- `view.js` handles the page elements and updates what the user sees.
- `controller.js` connects the model and the view. It responds to user actions,
  starts the clock updates, and coordinates the API calls.

The page gets the user's location through the browser's Geolocation API after
the user gives permission. The latitude and longitude are used to request
weather and time-zone information. If location access is denied or unavailable,
the app uses an IP-based location service as a less precise fallback.

We use the `Intl.DateTimeFormat` browser API to display the time in the selected
time zone. This lets the browser handle time-zone rules and daylight-saving
changes instead of calculating the offsets ourselves.

## APIs and services

- Open-Meteo for weather and city/time-zone lookups
- NASA's space science website for the picture of the day
- TimeAPI for time-zone information based on coordinates
- BigDataCloud for reverse location lookup
- ipapi.co as a fallback when browser geolocation is unavailable

The app sends location coordinates to the services needed to provide weather,
location, and time-zone information. The browser asks the user for permission
before providing the location.

## Running it locally

The project does not need a build step. To run it locally:

1. Download or clone the repository.
2. Open `index.html` in a browser.
3. Allow location access when the browser asks for it.

Some browser features and API requests may work more reliably when the project
is opened through a local development server instead of directly from a file.

## Project files

```text
Digital-Clock/
├── index.html
├── style.css
├── model.js
├── view.js
├── controller.js
├── config/
└── README.md
```

## Possible improvements

Some things we could add later include better loading states, more detailed
weather information, automated tests, and a more robust fallback when an
external API is unavailable.
