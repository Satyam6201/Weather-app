document.addEventListener("DOMContentLoaded", () => {
  const iconElement = document.querySelector(".weather-icon img");
  const tempElement = document.querySelector(".temperature-value p");
  const descElement = document.querySelector(".temperature-description p");
  const locationElement = document.querySelector(".location p");
  const windSpeedElement = document.querySelector(".wind-speed p");
  const notificationElement = document.querySelector(".notification");
  const toggleModeButton = document.getElementById("toggle-mode");
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");
  const forecastContainer = document.getElementById("forecast-container");

  const weather = {
    temperature: { unit: "celsius" },
  };

  const key = "82005d27a116c2880c8f0fcb866998a0";

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(setPosition, showError);
  } else {
    displayError("Browser doesn't support geolocation.");
  }

  function setPosition(position) {
    getWeatherByCoords(position.coords.latitude, position.coords.longitude);
  }

  function showError(error) {
    displayError(error.message);
  }

  function displayError(message) {
    notificationElement.style.display = "block";
    notificationElement.innerHTML = `<p>${message}</p>`;
  }

  function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        updateWeatherData(data);
        getForecast(lat, lon);
      })
      .catch(() => displayError("Unable to fetch weather."));
  }

  function getWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("City not found");
        return res.json();
      })
      .then(data => {
        updateWeatherData(data);
        getForecast(data.coord.lat, data.coord.lon);
      })
      .catch(() => displayError("City not found."));
  }

  function updateWeatherData(data) {
    weather.temperature.value = Math.floor(data.main.temp);
    weather.description = data.weather[0].description;
    weather.iconId = data.weather[0].icon;
    weather.city = data.name;
    weather.country = data.sys.country;
    weather.windSpeed = data.wind.speed;

    displayWeather();
  }

  function displayWeather() {
    iconElement.src = `https://openweathermap.org/img/wn/${weather.iconId}@2x.png`;
    tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
    windSpeedElement.innerHTML = `Wind: ${weather.windSpeed} km/h`;
  }

  function getForecast(lat, lon) {
    const api = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;

    fetch(api)
      .then(res => res.json())
      .then(data => {
        const daily = {};

        data.list.forEach(entry => {
          if (entry.dt_txt.includes("12:00:00")) {
            const date = new Date(entry.dt_txt).toDateString();
            daily[date] = entry;
          }
        });

        forecastContainer.innerHTML = "";
        Object.values(daily).slice(0, 7).forEach(day => {
          forecastContainer.innerHTML += `
            <div class="forecast-day">
              <p><strong>${new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}</strong></p>
              <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" width="50" />
              <p>${Math.round(day.main.temp)}°C</p>
              <p>${day.weather[0].main}</p>
            </div>`;
        });
      });
  }

  function celsiusToFahrenheit(temp) {
    return (temp * 9) / 5 + 32;
  }

  tempElement.addEventListener("click", () => {
    if (weather.temperature.value === undefined) return;

    if (weather.temperature.unit === "celsius") {
      const fahrenheit = celsiusToFahrenheit(weather.temperature.value);
      tempElement.innerHTML = `${Math.floor(fahrenheit)}°<span>F</span>`;
      weather.temperature.unit = "fahrenheit";
    } else {
      tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
      weather.temperature.unit = "celsius";
    }
  });

  toggleModeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  searchBtn.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city !== "") {
      getWeatherByCity(city);
      notificationElement.style.display = "none";
    }
  });
});
