// SELECT ELEMENTS
const iconElement = document.querySelector(".weather-icon img");
const tempElement = document.querySelector(".temperature-value p");
const descElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");

// App data
const weather = {
    temperature: { unit: "celsius" }
};

// APP CONSTANTS
const KELVIN = 273;
const key = "82005d27a116c2880c8f0fcb866998a0";

// CHECK IF BROWSER SUPPORTS GEOLOCATION
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(setPosition, showError);
} else {
    displayError("Browser doesn't support geolocation.");
}

// SET USER'S POSITION
function setPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    getWeather(latitude, longitude);
}

// SHOW ERROR
function showError(error) {
    displayError(error.message);
}

// DISPLAY ERROR MESSAGE
function displayError(message) {
    notificationElement.style.display = "block";
    notificationElement.innerHTML = `<p>${message}</p>`;
}

// FETCH WEATHER DATA
function getWeather(latitude, longitude) {
    let api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`;

    fetch(api)
        .then(response => response.json())
        .then(data => {
            weather.temperature.value = Math.floor(data.main.temp);
            weather.description = data.weather[0].description;
            weather.iconId = data.weather[0].icon;
            weather.city = data.name;
            weather.country = data.sys.country;
            displayWeather();
        })
        .catch(() => displayError("Could not fetch weather data."));
}

// DISPLAY WEATHER
function displayWeather() {
    iconElement.src = `https://openweathermap.org/img/wn/${weather.iconId}@2x.png`;
    tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
}

// CONVERT CELSIUS TO FAHRENHEIT
function celsiusToFahrenheit(temp) {
    return (temp * 9/5) + 32;
}

// TOGGLE TEMPERATURE UNIT
tempElement.addEventListener("click", function () {
    if (weather.temperature.value === undefined) return;

    if (weather.temperature.unit === "celsius") {
        let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
        tempElement.innerHTML = `${Math.floor(fahrenheit)}°<span>F</span>`;
        weather.temperature.unit = "fahrenheit";
    } else {
        tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
        weather.temperature.unit = "celsius";
    }
});
