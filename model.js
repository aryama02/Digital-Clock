class Model {
    constructor() {
        this.format = localStorage.getItem("format") || "12";
        this.unit = localStorage.getItem("temperatureUnit") || "F";
        this.lat = null;
        this.lon = null;
        this.offset = 0;
        this.timeZone = localStorage.getItem("timeZone") || "";
        this.picture = null;
        this.weather = null;
        this.locationName = "";
    }

    saveFormat(format) {
        this.format = format;
        localStorage.setItem("format", format);
    }

    saveTimeZone(timeZone) {
        this.timeZone = timeZone;
        localStorage.setItem("timeZone", timeZone);
    }

    saveUnit(unit) {
        this.unit = unit;
        localStorage.setItem("temperatureUnit", unit);
    }

    async getData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Could not load " + url);
        }
        return response.json();
    }

    async loadTime() {
        if (this.timeZone) {
            return;
        }

        const data = await this.getData(`https://timeapi.io/api/time/current/coordinate?latitude=${this.lat}&longitude=${this.lon}`);
        this.timeZone = data.timeZone;
    }

    getNow() {
        return new Date();
    }

    getTimeZone() {
        return this.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    async loadWeather() {
        const temperatureUnit = this.unit === "C" ? "celsius" : "fahrenheit";
        const windUnit = this.unit === "C" ? "kmh" : "mph";
        const data = await this.getData(`https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=${temperatureUnit}&wind_speed_unit=${windUnit}`);
        this.weather = data.current;
    }

    async findTimeZone(city) {
        const data = await this.getData(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const result = data.results?.[0];
        if (!result?.timezone) {
            throw new Error("City not found");
        }
        return result.timezone;
    }

    async loadLocationName() {
        const data = await this.getData(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${this.lat}&longitude=${this.lon}&localityLanguage=en`);
        const city = data.city || data.locality || data.principalSubdivision;
        const state = data.principalSubdivisionCode?.split("-").pop() || data.principalSubdivision;
        this.locationName = city && state ? `${city}, ${state}` : city || "Current location";
    }

    getToday() {
        const now = this.getNow();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return now.getFullYear() + "-" + month + "-" + day;
    }

    async loadPicture() {
        const today = this.getToday();
        const saved = JSON.parse(localStorage.getItem("background"));
        if (saved && saved.date === today && saved.explanation) {
            this.picture = saved;
            return;
        }

        const dateCode = today.slice(2).replaceAll("-", "");
        const data = await this.getData("https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=5&date_to=" + dateCode);
        const latest = data.find(item => item.media_type === "image" && item.hdurl);

        this.picture = {
            date: latest.date,
            image: latest.hdurl.split("?")[0] + "?w=2560",
            title: latest.title || "Today's picture",
            explanation: latest.explanation || "NASA has not provided a description for this picture yet.",
            source: latest.permalink || "https://science.nasa.gov/solar-system/"
        };
        localStorage.setItem("background", JSON.stringify(this.picture));
    }
}
