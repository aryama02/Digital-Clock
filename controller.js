class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.view.showFormat(this.model.format);
        this.view.bindFormat(format => this.changeFormat(format));

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
        this.view.showTime(this.model.getNow(), this.model.format);
    }

    findLocation() {
        navigator.geolocation.getCurrentPosition(position => {
            this.model.lat = position.coords.latitude;
            this.model.lon = position.coords.longitude;
            this.loadTime();
        });
    }

    async loadTime() {
        try {
            await this.model.loadTime();
            this.view.showTimeZone(this.model.timeZone);
        } catch (error) {
            this.view.showTimeZone("Computer time");
        }
    }

    async loadPicture() {
        await this.model.loadPicture();
        this.view.showPicture(this.model.picture);
    }

    changeFormat(format) {
        this.model.saveFormat(format);
        this.updateClock();
    }
}

const app = new Controller(new Model(), new View());
