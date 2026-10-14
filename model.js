class Model {
    constructor() {
        this.format = localStorage.getItem("format") || "12";
        this.lat = null;
        this.lon = null;
        this.offset = 0;
        this.timeZone = "";
        this.picture = null;
    }

    saveFormat(format) {
        this.format = format;
        localStorage.setItem("format", format);
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

    async loadPicture() {
        const today = this.getToday();
        const saved = JSON.parse(localStorage.getItem("background"));
        if (saved && saved.date === today) {
            this.picture = saved;
            return;
        }

        const dateCode = today.slice(2).replaceAll("-", "");
        const data = await this.getData("https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=5&date_to=" + dateCode);
        const latest = data.find(item => item.media_type === "image" && item.hdurl);

        this.picture = {
            date: latest.date,
            image: latest.hdurl.split("?")[0] + "?w=2560"
        };
        localStorage.setItem("background", JSON.stringify(this.picture));
    }
}
