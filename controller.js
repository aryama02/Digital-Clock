class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.view.showFormat(this.model.format);
        this.view.bindFormat(format => this.changeFormat(format));
        this.view.showUnit(this.model.unit);
        this.view.bindUnit(unit => this.changeUnit(unit));
        this.pomodoroSeconds = 25 * 60;
        this.pomodoroInterval = null;
        this.view.bindPomodoro(minutes => this.togglePomodoro(minutes), () => this.resetPomodoro());
        this.view.showPomodoro(this.pomodoroSeconds, false);
        this.view.bindTimeZone(timeZone => this.changeTimeZone(timeZone));
        this.view.bindPicture(() => this.showPictureDetails());
        this.view.showTimeZoneInput(localStorage.getItem("timeZone") || "");

        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        setInterval(() => this.refresh(), 30 * 60 * 1000);
        this.refresh();
    }

    refresh() {
        this.loadPicture();
        this.findLocation();
    }

    updateClock() {
        this.view.showTime(this.model.getNow(), this.model.format, this.model.getTimeZone());
    }

    findLocation() {
        if (navigator.geolocation) {
            this.locationWatch = navigator.geolocation.watchPosition(
                position => this.setLocation(position.coords.latitude, position.coords.longitude),
                () => this.findLocationByIp(),
                { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 }
            );
        } else {
            this.findLocationByIp();
        }
    }

    async findLocationByIp() {
        try {
            const location = await this.model.getData("https://ipapi.co/json/");
            const locationName = location.city && location.region_code ? `${location.city}, ${location.region_code}` : location.city;
            this.setLocation(location.latitude, location.longitude, location.timezone, locationName);
        } catch (error) {
            this.view.showWeatherError();
        }
    }

    async setLocation(latitude, longitude, timeZone = "", locationName = "") {
        const moved = this.model.lat !== latitude || this.model.lon !== longitude;
        this.model.lat = latitude;
        this.model.lon = longitude;

        if (locationName) {
            this.model.locationName = locationName;
        }

        if (timeZone && !localStorage.getItem("timeZone")) {
            this.model.saveTimeZone(timeZone);
            this.view.showTimeZoneInput(timeZone);
        }

        if (!moved) {
            return;
        }

        try {
            await this.model.loadTime();
            await this.model.loadWeather();
            if (!locationName) {
                await this.model.loadLocationName();
            }
            this.view.showTimeZone(this.model.getTimeZone());
            this.view.showWeatherLocation(this.model.locationName);
            this.view.showWeather(this.model.weather, this.model.unit);
        } catch (error) {
            this.view.showTimeZone("Computer time");
            this.view.showWeatherError();
        }
    }

    async loadTime() {
        try {
            await this.model.loadTime();
            this.view.showTimeZone(this.model.timeZone);
        } catch (error) {
            this.view.showTimeZone("Computer time");
        }
    }

    async changeTimeZone(timeZone) {
        const aliases = {
            mumbai: "Asia/Kolkata",
            delhi: "Asia/Kolkata",
            "new delhi": "Asia/Kolkata",
            beijing: "Asia/Shanghai",
            shanghai: "Asia/Shanghai",
            moscow: "Europe/Moscow",
            toronto: "America/Toronto",
            vancouver: "America/Vancouver",
            edmonton: "America/Edmonton"
        };
        let normalizedTimeZone = aliases[timeZone.toLowerCase()] || timeZone;

        try {
            if (!normalizedTimeZone.includes("/")) {
                normalizedTimeZone = await this.model.findTimeZone(normalizedTimeZone);
            }
            new Intl.DateTimeFormat("en-US", { timeZone: normalizedTimeZone }).format();
            this.model.saveTimeZone(normalizedTimeZone);
            this.updateClock();
            this.view.showTimeZone(normalizedTimeZone);
            this.view.showTimeZoneInput(normalizedTimeZone);
        } catch (error) {
            this.view.showTimeZone("Invalid timezone");
        }
    }

    async loadPicture() {
        try {
            await this.model.loadPicture();
            this.view.showPicture(this.model.picture);
        } catch (error) {
            this.view.showPictureError();
        }
    }

    showPictureDetails() {
        if (this.model.picture) {
            this.view.showPictureDetails(this.model.picture);
        }
    }

    changeFormat(format) {
        this.model.saveFormat(format);
        this.updateClock();
    }

    togglePomodoro(minutes) {
        if (this.pomodoroInterval) {
            clearInterval(this.pomodoroInterval);
            this.pomodoroInterval = null;
            this.view.showPomodoro(this.pomodoroSeconds, false);
            return;
        }

        if (this.pomodoroSeconds <= 0 || this.pomodoroSeconds === 25 * 60) {
            const selectedMinutes = Math.min(120, Math.max(1, minutes || 25));
            this.pomodoroSeconds = selectedMinutes * 60;
        }

        this.pomodoroInterval = setInterval(() => this.tickPomodoro(), 1000);
        this.view.showPomodoro(this.pomodoroSeconds, true);
    }

    tickPomodoro() {
        this.pomodoroSeconds -= 1;
        if (this.pomodoroSeconds <= 0) {
            this.pomodoroSeconds = 0;
            clearInterval(this.pomodoroInterval);
            this.pomodoroInterval = null;
        }
        this.view.showPomodoro(this.pomodoroSeconds, Boolean(this.pomodoroInterval));
    }

    resetPomodoro() {
        clearInterval(this.pomodoroInterval);
        this.pomodoroInterval = null;
        const selectedMinutes = Math.min(120, Math.max(1, Number(this.view.pomodoroMinutes.value) || 25));
        this.pomodoroSeconds = selectedMinutes * 60;
        this.view.showPomodoro(this.pomodoroSeconds, false);
    }

    async changeUnit(unit) {
        this.model.saveUnit(unit);
        if (!this.model.lat || !this.model.lon) {
            return;
        }

        try {
            await this.model.loadWeather();
            this.view.showWeather(this.model.weather, this.model.unit);
        } catch (error) {
            this.view.showWeatherError();
        }
    }
}

const app = new Controller(new Model(), new View());
