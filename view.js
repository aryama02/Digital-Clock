class View {
    constructor() {
        this.background = document.getElementById("background");
        this.photo = document.getElementById("photo");
        this.hour12 = document.getElementById("hour12");
        this.hour24 = document.getElementById("hour24");
        this.date = document.getElementById("date");
        this.time = document.getElementById("time");
        this.timeZone = document.getElementById("time-zone");
    }

    bindFormat(handler) {
        this.hour12.addEventListener("change", () => handler("12"));
        this.hour24.addEventListener("change", () => handler("24"));
    }

    showFormat(format) {
        this.hour12.checked = format === "12";
        this.hour24.checked = format === "24";
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

    showPicture(picture) {
        const image = new Image();
        image.onload = () => {
            this.background.style.backgroundImage = `url("${picture.image}")`;
            this.photo.style.backgroundImage = `url("${picture.image}")`;
            this.background.classList.add("show");
            this.photo.classList.add("show");
        };
        image.src = picture.image;
    }
}
