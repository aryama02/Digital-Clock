class View {
    constructor() {
        this.background = document.getElementById("background");
        this.photo = document.getElementById("photo");
        this.hour12 = document.getElementById("hour12");
        this.hour24 = document.getElementById("hour24");
        this.fahrenheit = document.getElementById("fahrenheit");
        this.celsius = document.getElementById("celsius");
        this.date = document.getElementById("date");
        this.time = document.getElementById("time");
        this.timeZone = document.getElementById("time-zone");
        this.timeZoneInput = document.getElementById("timezone-input");
        this.weatherLocation = document.getElementById("weather-location");
        this.weather = document.getElementById("weather-content");
        this.pomodoroDisplay = document.getElementById("pomodoro-display");
        this.pomodoroMinutes = document.getElementById("pomodoro-minutes");
        this.pomodoroStart = document.getElementById("pomodoro-start");
        this.pomodoroReset = document.getElementById("pomodoro-reset");
        this.quoteBox = document.getElementById("quote-box");
        this.pictureDialog = document.getElementById("picture-dialog");
        this.closePicture = document.getElementById("close-picture");
        this.pictureTitle = document.getElementById("picture-title");
        this.pictureExplanation = document.getElementById("picture-explanation");
        this.pictureSource = document.getElementById("picture-source");
    }

    bindFormat(handler) {
        this.hour12.addEventListener("change", () => handler("12"));
        this.hour24.addEventListener("change", () => handler("24"));
    }

    bindTimeZone(handler) {
        this.timeZoneInput.addEventListener("change", () => handler(this.timeZoneInput.value.trim()));
    }

    bindUnit(handler) {
        this.fahrenheit.addEventListener("change", () => handler("F"));
        this.celsius.addEventListener("change", () => handler("C"));
    }

    bindPomodoro(startHandler, resetHandler) {
        this.pomodoroStart.addEventListener("click", () => startHandler(Number(this.pomodoroMinutes.value)));
        this.pomodoroReset.addEventListener("click", resetHandler);
    }

    showPomodoro(seconds, running) {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
        const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
        this.pomodoroDisplay.textContent = `${minutes}:${remainingSeconds}`;
        this.pomodoroStart.textContent = running ? "Pause" : "Start";
    }

    bindPicture(handler) {
        this.quoteBox.addEventListener("click", handler);
        this.quoteBox.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handler();
            }
        });
        this.closePicture.addEventListener("click", () => this.pictureDialog.close());
    }

    showFormat(format) {
        this.hour12.checked = format === "12";
        this.hour24.checked = format === "24";
    }

    showUnit(unit) {
        this.fahrenheit.checked = unit === "F";
        this.celsius.checked = unit === "C";
    }

    showTime(now, format, timeZone) {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone,
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: format === "12"
        }).formatToParts(now).reduce((values, part) => {
            values[part.type] = part.value;
            return values;
        }, {});
        const hours = format === "12" ? parts.hour : parts.hour.padStart(2, "0");
        const ending = format === "12" ? ` ${parts.dayPeriod}` : "";
        const minutes = parts.minute;
        const seconds = parts.second;
        this.time.innerHTML = `${hours}:${minutes}<span>:${seconds}${ending}</span>`;
        this.date.textContent = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(now);
    }

    showTimeZoneInput(timeZone) {
        this.timeZoneInput.value = timeZone;
    }

    showTimeZone(timeZone) {
        this.timeZone.textContent = timeZone.replaceAll("_", " ");
    }

    showWeather(weather, unit) {
        const description = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Rime fog",
            51: "Light drizzle",
            61: "Rain",
            71: "Snow",
            80: "Rain showers",
            95: "Thunderstorm"
        }[weather.weather_code] || "Changing conditions";
        const windUnit = unit === "C" ? "km/h" : "mph";
        this.weather.innerHTML = `<strong>${Math.round(weather.temperature_2m)}&deg;${unit}</strong><span>${description}</span><span>Humidity ${weather.relative_humidity_2m}% &middot; Wind ${Math.round(weather.wind_speed_10m)} ${windUnit}</span>`;
    }

    showWeatherLocation(locationName) {
        this.weatherLocation.textContent = locationName;
    }

    showWeatherError() {
        this.weatherLocation.textContent = "Location unavailable";
        this.weather.textContent = "Weather unavailable";
    }

    showPicture(picture) {
        this.pictureTitle.textContent = picture.title;
        const image = new Image();
        image.onload = () => {
            this.background.style.backgroundImage = `url("${picture.image}")`;
            this.photo.style.backgroundImage = `url("${picture.image}")`;
            this.background.classList.add("show");
            this.photo.classList.add("show");
        };
        image.src = picture.image;
    }

    showPictureDetails(picture) {
        this.pictureTitle.textContent = picture.title;
        this.pictureExplanation.innerHTML = picture.explanation;
        this.pictureSource.href = picture.source;
        this.pictureDialog.showModal();
    }

    showPictureError() {
        document.getElementById("picture-prompt").textContent = "Picture details unavailable";
    }
}
