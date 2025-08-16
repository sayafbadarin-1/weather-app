function initializeApp() {
    // --- DOM Elements ---
    const pageTitle = document.getElementById('page-title');
    const pressureLabel = document.getElementById('pressure-label');
    const humidityLabel = document.getElementById('humidity-label');
    const windLabel = document.getElementById('wind-label');
    const sunriseLabel = document.getElementById('sunrise-label');
    const sunsetLabel = document.getElementById('sunset-label');
    const visibilityLabel = document.getElementById('visibility-label');
    const archiveButton = document.getElementById('archive-button');
    const historyLink = document.getElementById('history-link');
    const forecastLink = document.getElementById('forecast-link');
    const locationDisplay = document.getElementById('location-display');
    const tempDisplay = document.getElementById('temp-display');
    const pressureDisplay = document.getElementById('pressure-display');
    const humidityDisplay = document.getElementById('humidity-display');
    const windDisplay = document.getElementById('wind-display');
    const sunriseDisplay = document.getElementById('sunrise-display');
    const sunsetDisplay = document.getElementById('sunset-display');
    const visibilityDisplay = document.getElementById('visibility-display');
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    // --- State Variables ---
    let currentLang = localStorage.getItem('language') || 'ar';
    let currentTheme = localStorage.getItem('theme') || 'light';
    let currentWeatherData = null;
    const API_KEY = '3ef01545176e9932f61ec5b8c67903be';

    // --- Functions ---
    function updateUIText(lang) {
        const t = translations[lang];
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        pageTitle.textContent = t.pageTitle;
        pressureLabel.textContent = t.pressureLabel;
        humidityLabel.textContent = t.humidityLabel;
        windLabel.textContent = t.windLabel;
        sunriseLabel.textContent = t.sunriseLabel;
        sunsetLabel.textContent = t.sunsetLabel;
        visibilityLabel.textContent = t.visibilityLabel;
        archiveButton.textContent = t.archiveButton;
        historyLink.textContent = t.historyLink;
        forecastLink.textContent = t.forecastLink;
        langToggleBtn.textContent = lang === 'ar' ? 'EN' : 'ع';
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleBtn.textContent = '🌙';
        }
    }

    function getLocation() {
        locationDisplay.textContent = translations[currentLang].loading;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getWeatherData, showError);
        } else {
            locationDisplay.textContent = "Geolocation not supported.";
        }
    }

    // دالة لتحويل الوقت من Unix timestamp إلى ساعة ودقيقة
    function formatTime(timestamp, timezone) {
        const date = new Date((timestamp + timezone) * 1000);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // دالة لتحويل الرؤية من متر إلى كيلومتر
    function formatVisibility(visibility) {
        if (visibility >= 1000) {
            return (visibility / 1000).toFixed(1);
        } else {
            return (visibility / 1000).toFixed(2);
        }
    }

    async function getWeatherData(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        if (API_KEY === 'ضع_مفتاح_الـAPI_الخاص_بك_هنا' || API_KEY.length < 30) {
            locationDisplay.textContent = translations[currentLang].fetchFailAPIKey;
            return;
        }
        const API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${currentLang}`;
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            currentWeatherData = data;
            updateDataUI(data);
        } catch (error) {
            locationDisplay.textContent = translations[currentLang].fetchFail;
            console.error("Fetch Error:", error);
        }
    }

    function showError(error) {
        if (error.code === error.PERMISSION_DENIED) {
            locationDisplay.textContent = translations[currentLang].fetchFailPermission;
        }
    }

    function updateDataUI(data) {
        // البيانات الأساسية
        tempDisplay.textContent = Math.round(data.main.temp);
        pressureDisplay.textContent = data.main.pressure;
        humidityDisplay.textContent = `${data.main.humidity} %`;
        windDisplay.textContent = `${data.wind.speed.toFixed(1)} m/s`;

        // البيانات الجديدة
        // شروق وغروب الشمس
        if (data.sys && data.sys.sunrise && data.sys.sunset) {
            sunriseDisplay.textContent = formatTime(data.sys.sunrise, data.timezone);
            sunsetDisplay.textContent = formatTime(data.sys.sunset, data.timezone);
        }

        // مدى الرؤية
        if (data.visibility) {
            visibilityDisplay.textContent = `${formatVisibility(data.visibility)} km`;
        }

        locationDisplay.textContent = `${data.name} - ${data.weather[0].description}`;
        archiveButton.style.display = 'block';
    }

    // --- Event Listeners ---
    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        localStorage.setItem('language', currentLang);
        updateUIText(currentLang);
        getLocation();
    });

    themeToggleBtn.addEventListener('click', () => {
        let newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    archiveButton.addEventListener('click', () => {
        if (!currentWeatherData) return;
        const t = translations[currentLang];
        const readingToSave = {
            location: currentWeatherData.name,
            timestamp: new Date().toLocaleString(currentLang, { dateStyle: 'medium', timeStyle: 'short' }),
            temp: Math.round(currentWeatherData.main.temp),
            pressure: currentWeatherData.main.pressure,
            humidity: `${currentWeatherData.main.humidity} %`,
            wind: `${currentWeatherData.wind.speed.toFixed(1)} m/s`,
            sunrise: currentWeatherData.sys ? formatTime(currentWeatherData.sys.sunrise, currentWeatherData.timezone) : '--:--',
            sunset: currentWeatherData.sys ? formatTime(currentWeatherData.sys.sunset, currentWeatherData.timezone) : '--:--',
            visibility: currentWeatherData.visibility ? `${formatVisibility(currentWeatherData.visibility)} km` : '-- km'
        };
        let readings = JSON.parse(localStorage.getItem('weatherReadings')) || [];
        readings.push(readingToSave);
        localStorage.setItem('weatherReadings', JSON.stringify(readings));
        alert(t.archiveSuccess);
    });

    // --- Initial Run ---
    archiveButton.style.display = 'none';
    applyTheme(currentTheme);
    updateUIText(currentLang);
    getLocation();
}

// Use 'pageshow' to re-initialize when navigating back to the page
window.addEventListener('pageshow', initializeApp);