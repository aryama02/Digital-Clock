const timeElement = document.querySelector('#time');
const dateElement = document.querySelector('#date');
const timezoneElement = document.querySelector('#timezone');
const formatToggle = document.querySelector('#format-toggle');
const secondsToggle = document.querySelector('#seconds-toggle');
const themeToggle = document.querySelector('#theme-toggle');
const apodTitle = document.querySelector('#apod-title');
const apodExplanation = document.querySelector('#apod-explanation');
const apodBackdrop = document.querySelector('.apod-backdrop');
const apodCacheKey = 'digital-clock-apod-v2';

let is24Hour = true;
let showSeconds = true;

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

function updateClock() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    ...(showSeconds ? { second: '2-digit' } : {}),
    hour12: !is24Hour,
  });

  timeElement.textContent = formatter.format(now);
  dateElement.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(now);
  timezoneElement.textContent = `${Intl.DateTimeFormat().resolvedOptions().timeZone} · ${timeFormatter.format(now)} local reference`;
}

async function loadApod() {
  if (!window.NASA_API_KEY) {
    apodTitle.textContent = 'Add a NASA API key to load today\'s image';
    return;
  }

  const today = new Date().toLocaleDateString('en-CA');
  let cachedApod = null;

  try {
    cachedApod = JSON.parse(localStorage.getItem(apodCacheKey));
    if (!cachedApod?.url || !isApodImageUrl(cachedApod.url)) {
      localStorage.removeItem(apodCacheKey);
      cachedApod = null;
    }
  } catch (error) {
    console.warn('Unable to read the APOD cache.', error);
  }

  if (cachedApod?.url) {
    applyApod(cachedApod);
  }

  if (cachedApod?.date === today) {
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(window.NASA_API_KEY)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      throw new Error(`NASA APOD request failed with ${response.status}`);
    }

    const apod = await response.json();
    if (apod.media_type === 'image' && isApodImageUrl(apod.hdurl || apod.url)) {
      const apodToCache = {
        date: today,
        title: apod.title,
        explanation: apod.explanation,
        url: apod.hdurl || apod.url,
      };
      await preloadImage(apodToCache.url);
      localStorage.setItem(apodCacheKey, JSON.stringify(apodToCache));
      applyApod(apodToCache);
    } else {
      apodTitle.textContent = apod.title;
      apodExplanation.textContent = `${apod.explanation} Today's APOD is a video.`;
    }
  } catch (error) {
    if (!cachedApod?.url) {
      apodTitle.textContent = 'NASA image unavailable';
      apodExplanation.textContent = 'The clock is still running with its default background.';
    }
    console.error(error);
  }
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isApodImageUrl(value) {
  return isHttpUrl(value) && !value.toLowerCase().includes('nasa-logo');
}

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = () => reject(new Error('NASA APOD image could not be loaded'));
    image.src = url;
  });
}

function applyApod(apod) {
  apodTitle.textContent = apod.title;
  apodExplanation.textContent = apod.explanation;
  apodBackdrop.style.backgroundImage = `url(${JSON.stringify(apod.url)})`;
  document.body.classList.add('has-apod');
}

formatToggle.addEventListener('click', () => {
  is24Hour = !is24Hour;
  formatToggle.textContent = is24Hour ? '24-hour' : '12-hour';
  formatToggle.classList.toggle('active', is24Hour);
  updateClock();
});

secondsToggle.addEventListener('click', () => {
  showSeconds = !showSeconds;
  secondsToggle.textContent = showSeconds ? 'Seconds on' : 'Seconds off';
  secondsToggle.setAttribute('aria-pressed', String(showSeconds));
  secondsToggle.classList.toggle('active', showSeconds);
  updateClock();
});

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light-theme');
  themeToggle.textContent = isLight ? '☼' : '◐';
  themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
});

updateClock();
loadApod();
setInterval(updateClock, 1000);
