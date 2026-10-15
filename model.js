class Model {
    constructor() {
        this.format = localStorage.getItem("format") || "12";
        this.unit = localStorage.getItem("unit") || "fahrenheit";
        this.brightness = localStorage.getItem("brightness") || 100;
        this.lat = null;
        this.lon = null;
        this.offset = 0;
        this.timeZone = "";
        this.weather = null;
        this.pictures = [];
        this.selected = 0;
        this.timerTotal = 0;
        this.timerLeft = 0;
    }

    save(name, value) {
        this[name] = value;
        localStorage.setItem(name, value);
    }

    async getData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Could not load " + url);
        }
        return response.json();
    }

    async loadTime() {
        const data = await this.getData(`https://timeapi.io/api/time/current/coordinate?latitude=${this.lat}&longitude=${this.lon}`);
        const apiTime = new Date(data.year, data.month - 1, data.day, data.hour, data.minute, data.seconds);
        this.offset = apiTime - Date.now();
        this.timeZone = data.timeZone;
    }

    getNow() {
        return new Date(Date.now() + this.offset);
    }

    getToday() {
        const now = this.getNow();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return now.getFullYear() + "-" + month + "-" + day;
    }

    async loadWeather() {
        let windUnit = "kmh";
        if (this.unit === "fahrenheit") {
            windUnit = "mph";
        }

        const data = await this.getData(`https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}` +
            "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m" +
            "&daily=precipitation_probability_max,sunrise,sunset&forecast_days=1" +
            `&timezone=auto&temperature_unit=${this.unit}&wind_speed_unit=${windUnit}`);

        this.weather = {
            temperature: Math.round(data.current.temperature_2m),
            feelsLike: Math.round(data.current.apparent_temperature),
            humidity: data.current.relative_humidity_2m,
            wind: Math.round(data.current.wind_speed_10m),
            code: data.current.weather_code,
            rain: data.daily.precipitation_probability_max[0] || 0,
            sunrise: data.daily.sunrise[0].slice(11),
            sunset: data.daily.sunset[0].slice(11)
        };
    }

    getWeatherText() {
        const code = this.weather.code;
        if (code === 0) return "Clear sky";
        if (code === 1) return "Mostly clear";
        if (code === 2) return "Partly cloudy";
        if (code === 3) return "Cloudy";
        if (code <= 48) return "Foggy";
        if (code <= 57) return "Drizzle";
        if (code <= 67) return "Rain";
        if (code <= 77) return "Snow";
        if (code <= 82) return "Rain showers";
        if (code <= 86) return "Snow showers";
        return "Thunderstorms";
    }

    getSky() {
        const now = this.getNow();
        const time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
        return {
            isDay: time >= this.weather.sunrise && time < this.weather.sunset,
            isClear: this.weather.code <= 1,
            sunrise: this.weather.sunrise,
            sunset: this.weather.sunset
        };
    }

    async loadPictures() {
        const today = this.getToday();
        const saved = JSON.parse(localStorage.getItem("pictures"));
        if (saved && saved[0].date === today) {
            this.pictures = saved;
            return;
        }

        const dateCode = today.slice(2).replaceAll("-", "");
        const data = await this.getData("https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=5&date_to=" + dateCode);

        this.pictures = [];
        for (const item of data) {
            if (item.media_type === "image" && item.hdurl && this.pictures.length < 3) {
                this.pictures.push({
                    date: item.date,
                    title: item.title,
                    text: this.cleanText(item.explanation),
                    credit: this.cleanText(item.credit),
                    image: item.hdurl.split("?")[0] + "?w=2560"
                });
            }
        }
        this.selected = 0;
        localStorage.setItem("pictures", JSON.stringify(this.pictures));
    }

    cleanText(html) {
        const page = new DOMParser().parseFromString(html, "text/html");
        const text = page.body.textContent.replace("Explanation:", "");
        return text.split("Tomorrow's picture")[0].trim();
    }

    startTimer(minutes) {
        this.timerTotal = minutes * 60;
        this.timerLeft = this.timerTotal;
    }

    resetTimer() {
        this.timerTotal = 0;
        this.timerLeft = 0;
    }

    getTimerPercent() {
        if (this.timerTotal === 0) {
            return 0;
        }
        return this.timerLeft / this.timerTotal * 100;
    }
}
