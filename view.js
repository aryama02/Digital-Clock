class View {
    constructor() {
        this.background = document.getElementById("background");
        this.dim = document.getElementById("dim");
        this.header = document.querySelector("header");
        this.settingsButton = document.getElementById("settings-button");
        this.closeButton = document.getElementById("close-button");
        this.brightness = document.getElementById("brightness");
        this.hour12 = document.getElementById("hour12");
        this.hour24 = document.getElementById("hour24");
        this.fahrenheit = document.getElementById("fahrenheit");
        this.celsius = document.getElementById("celsius");
        this.date = document.getElementById("date");
        this.time = document.getElementById("time");
        this.timeZone = document.getElementById("time-zone");
        this.sky = document.getElementById("sky");
        this.temperature = document.getElementById("temperature");
        this.condition = document.getElementById("condition");
        this.feelsLike = document.getElementById("feels-like");
        this.humidity = document.getElementById("humidity");
        this.timerBox = document.getElementById("timer-box");
        this.timerDisplay = document.getElementById("timer-display");
        this.timerMinutes = document.getElementById("timer-minutes");
        this.startButton = document.getElementById("start-button");
        this.resetButton = document.getElementById("reset-button");
        this.timerBar = document.getElementById("timer-bar");
        this.quoteBox = document.getElementById("quote-box");
        this.pictureDialog = document.getElementById("picture-dialog");
        this.closePicture = document.getElementById("close-picture");
        this.pictureTitle = document.getElementById("picture-title");
        this.pictureText = document.getElementById("picture-text");
        this.pictureCredit = document.getElementById("picture-credit");
        this.picturePrompt = document.getElementById("picture-prompt");
        this.dayButtons = document.querySelectorAll(".day-button");
    }

    bindSettings(handler) {
        this.settingsButton.addEventListener("click", handler);
        this.closeButton.addEventListener("click", handler);
    }

    bindBrightness(handler) {
        this.brightness.addEventListener("input", () => handler(this.brightness.value));
    }

    bindFormat(handler) {
        this.hour12.addEventListener("change", () => handler("12"));
        this.hour24.addEventListener("change", () => handler("24"));
    }

    bindUnit(handler) {
        this.fahrenheit.addEventListener("change", () => handler("fahrenheit"));
        this.celsius.addEventListener("change", () => handler("celsius"));
    }

    bindTimer(startHandler, resetHandler) {
        this.startButton.addEventListener("click", startHandler);
        this.resetButton.addEventListener("click", resetHandler);
    }

    bindPicture(handler) {
        this.quoteBox.addEventListener("click", handler);
        this.closePicture.addEventListener("click", handler);
    }

    bindDays(handler) {
        for (let i = 0; i < this.dayButtons.length; i++) {
            this.dayButtons[i].addEventListener("click", () => handler(i));
        }
    }

    toggleSettings() {
        this.header.classList.toggle("open");
    }

    togglePicture() {
        if (this.pictureDialog.open) {
            this.pictureDialog.close();
        } else {
            this.pictureDialog.showModal();
        }
    }

    showBrightness(value) {
        this.brightness.value = value;
        this.dim.style.opacity = (100 - value) / 100;
    }

    showFormat(format) {
        this.hour12.checked = format === "12";
        this.hour24.checked = format === "24";
    }

    showUnit(unit) {
        this.fahrenheit.checked = unit === "fahrenheit";
        this.celsius.checked = unit === "celsius";
    }

    showTime(now, format) {
        let hours = now.getHours();
        let ending = "";
        if (format === "12") {
            ending = hours < 12 ? " AM" : " PM";
            hours = hours % 12;
            if (hours === 0) {
                hours = 12;
            }
        } else {
            hours = String(hours).padStart(2, "0");
        }

        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        this.time.innerHTML = `${hours}:${minutes}<span>:${seconds}${ending}</span>`;
        this.date.textContent = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }

    showTimeZone(timeZone) {
        this.timeZone.textContent = timeZone.replaceAll("_", " ");
    }

    formatTime(time, format) {
        if (format === "24") {
            return time;
        }
        let hours = Number(time.slice(0, 2));
        const ending = hours < 12 ? " AM" : " PM";
        hours = hours % 12;
        if (hours === 0) {
            hours = 12;
        }
        return hours + time.slice(2) + ending;
    }

    showSky(sky, format) {
        const sunrise = this.formatTime(sky.sunrise, format);
        const sunset = this.formatTime(sky.sunset, format);

        if (sky.isDay && sky.isClear) {
            this.sky.textContent = `Sunset at ${sunset}, clear skies tonight for stargazing`;
        } else if (sky.isDay) {
            this.sky.textContent = `Sunset at ${sunset}, clouds might hide the stars tonight`;
        } else if (sky.isClear) {
            this.sky.textContent = `Clear night, go look at the stars! Sunrise at ${sunrise}`;
        } else {
            this.sky.textContent = `Too cloudy for stars tonight. Sunrise at ${sunrise}`;
        }
    }

    showWeather(weather, text, unit) {
        let letter = "C";
        let windUnit = "km/h";
        if (unit === "fahrenheit") {
            letter = "F";
            windUnit = "mph";
        }

        this.temperature.textContent = weather.temperature + "°" + letter;
        this.condition.textContent = text;
        this.feelsLike.textContent = `Feels like ${weather.feelsLike}° · Rain chance ${weather.rain}%`;
        this.humidity.textContent = `Humidity ${weather.humidity}% · Wind ${weather.wind} ${windUnit}`;
    }

    showWeatherMessage(message) {
        this.condition.textContent = message;
    }

    getMinutes() {
        const minutes = Math.round(this.timerMinutes.value);
        if (minutes < 1) {
            return 25;
        }
        return minutes;
    }

    showTimer(secondsLeft, percent, running) {
        const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
        const seconds = String(secondsLeft % 60).padStart(2, "0");
        this.timerDisplay.textContent = minutes + ":" + seconds;
        this.timerBar.style.width = percent + "%";
        this.startButton.textContent = running ? "Pause" : "Start";
        this.timerBox.classList.remove("done");
    }

    showTimerDone() {
        this.timerDisplay.textContent = "Good job!";
        this.startButton.textContent = "Start";
        this.timerBox.classList.add("done");
    }

    showPicture(pictures, selected) {
        const picture = pictures[selected];
        this.background.style.backgroundImage = `url("${picture.image}")`;
        this.pictureTitle.textContent = picture.title;
        this.pictureText.textContent = picture.text;
        this.pictureCredit.textContent = "Image credit: " + picture.credit;

        for (let i = 0; i < this.dayButtons.length; i++) {
            const date = new Date(pictures[i].date + "T00:00");
            this.dayButtons[i].textContent = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            this.dayButtons[i].className = "day-button";
        }
        this.dayButtons[selected].className = "day-button active";
    }

    showPictureError() {
        this.picturePrompt.textContent = "NASA picture not available";
    }
}
