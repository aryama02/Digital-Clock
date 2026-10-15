class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.timer = null;

        this.view.showBrightness(this.model.brightness);
        this.view.showFormat(this.model.format);
        this.view.showUnit(this.model.unit);

        this.view.bindSettings(() => this.view.toggleSettings());
        this.view.bindBrightness(value => this.changeBrightness(value));
        this.view.bindFormat(format => this.changeFormat(format));
        this.view.bindUnit(unit => this.changeUnit(unit));
        this.view.bindTimer(() => this.toggleTimer(), () => this.resetTimer());
        this.view.bindPicture(() => this.view.togglePicture());
        this.view.bindDays(index => this.chooseDay(index));

        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        setInterval(() => this.refresh(), 30 * 60 * 1000);
        this.refresh();
    }

    refresh() {
        this.loadPicture();
        navigator.geolocation.getCurrentPosition(position => {
            this.model.setLocation(position.coords.latitude, position.coords.longitude);
            this.loadTimeAndWeather();
        }, () => {
            this.view.showWeatherMessage("Allow location to see the weather");
        });
    }

    updateClock() {
        this.view.showTime(this.model.getNow(), this.model.format);
    }

    async loadTimeAndWeather() {
        try {
            await this.model.loadTime();
            this.view.showTimeZone(this.model.timeZone);
        } catch (error) {
            this.view.showTimeZone("Computer time");
        }
        this.loadWeather();
    }

    async loadWeather() {
        try {
            await this.model.loadWeather();
            this.view.showWeather(this.model.weather, this.model.getWeatherText(), this.model.unit);
            this.view.showSky(this.model.getSky(), this.model.format);
        } catch (error) {
            this.view.showWeatherMessage("Could not load the weather");
        }
    }

    async loadPicture() {
        try {
            await this.model.loadPictures();
            this.view.showPicture(this.model.pictures, this.model.selected, this.model.getToday());
        } catch (error) {
            this.view.showPictureError();
        }
    }

    chooseDay(index) {
        this.model.selectPicture(index);
        this.view.showPicture(this.model.pictures, index, this.model.getToday());
    }

    changeBrightness(value) {
        this.model.save("brightness", value);
        this.view.showBrightness(value);
    }

    changeFormat(format) {
        this.model.save("format", format);
        this.updateClock();
        if (this.model.weather) {
            this.view.showSky(this.model.getSky(), format);
        }
    }

    changeUnit(unit) {
        this.model.save("unit", unit);
        if (this.model.weather) {
            this.loadWeather();
        }
    }

    toggleTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        } else {
            if (this.model.timerLeft === 0) {
                this.model.startTimer(this.view.getMinutes());
            }
            this.timer = setInterval(() => this.tickTimer(), 1000);
        }
        this.showTimer();
    }

    tickTimer() {
        this.model.tickTimer();
        this.showTimer();
        if (this.model.timerLeft === 0) {
            clearInterval(this.timer);
            this.timer = null;
            this.view.showTimerDone();
        }
    }

    resetTimer() {
        clearInterval(this.timer);
        this.timer = null;
        this.model.resetTimer();
        this.view.showTimer(this.view.getMinutes() * 60, 0, false);
    }

    showTimer() {
        this.view.showTimer(this.model.timerLeft, this.model.getTimerPercent(), this.timer !== null);
    }
}

const app = new Controller(new Model(), new View());
