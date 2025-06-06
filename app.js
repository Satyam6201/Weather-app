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

  // Extra details elements
  const feelsLikeElement = document.getElementById("feels-like");
  const humidityElement = document.getElementById("humidity");
  const pressureElement = document.getElementById("pressure");
  const sunriseElement = document.getElementById("sunrise");
  const sunsetElement = document.getElementById("sunset");
  const windDirectionElement = document.getElementById("wind-direction");
  const cityPhoto = document.getElementById("city-photo");
  const loader = document.getElementById("loader");
  const windArrow = document.getElementById("wind-arrow");

  const weather = {
    temperature: { unit: "celsius" },
  };

  const OPENWEATHER_KEY = "82005d27a116c2880c8f0fcb866998a0";
  const UNSPLASH_ACCESS_KEY = "YOUR_UNSPLASH_ACCESS_KEY"; // <--- Replace with your Unsplash API key

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
    hideLoader();
  }

  function showLoader() {
    loader.style.display = "block";
  }

  function hideLoader() {
    loader.style.display = "none";
  }

  function getWeatherByCoords(lat, lon) {
    showLoader();
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        updateWeatherData(data);
        getForecast(lat, lon);
        notificationElement.style.display = "none";
      })
      .catch(() => displayError("Unable to fetch weather."))
      .finally(() => hideLoader());
  }

  function getWeatherByCity(city) {
    showLoader();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_KEY}&units=metric`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("City not found");
        return res.json();
      })
      .then((data) => {
        updateWeatherData(data);
        getForecast(data.coord.lat, data.coord.lon);
        notificationElement.style.display = "none";
      })
      .catch(() => displayError("City not found."))
      .finally(() => hideLoader());
  }

  function updateWeatherData(data) {
    weather.temperature.value = Math.floor(data.main.temp);
    weather.description = data.weather[0].description;
    weather.iconId = data.weather[0].icon;
    weather.city = data.name;
    weather.country = data.sys.country;
    weather.windSpeed = data.wind.speed;
    weather.feels_like = data.main.feels_like;
    weather.humidity = data.main.humidity;
    weather.pressure = data.main.pressure;
    weather.sunrise = data.sys.sunrise;
    weather.sunset = data.sys.sunset;
    weather.wind_deg = data.wind.deg;

    displayWeather();
    fetchCityImage(data.name);
  }

  function displayWeather() {
    iconElement.src = `https://openweathermap.org/img/wn/${weather.iconId}@2x.png`;
    tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country} <img src="https://flagcdn.com/24x18/${weather.country.toLowerCase()}.png" alt="flag" />`;
    windSpeedElement.innerHTML = `Wind: ${weather.windSpeed} km/h`;

    feelsLikeElement.innerHTML = `Feels Like: ${Math.round(weather.feels_like)}°C`;

    updateProgressBar("humidity", weather.humidity);
    updateProgressBar("pressure", weather.pressure, 1100);

    sunriseElement.innerHTML = `Sunrise: ${new Date(weather.sunrise * 1000).toLocaleTimeString()}`;
    sunsetElement.innerHTML = `Sunset: ${new Date(weather.sunset * 1000).toLocaleTimeString()}`;

    windDirectionElement.firstChild.textContent = `Direction: ${getWindDirection(weather.wind_deg)}`;
    updateWindArrow(weather.wind_deg);
  }

  function updateProgressBar(id, value, max = 100) {
    const box = document.getElementById(id);
    if (!box) return;
    const fill = box.querySelector(".progress-bar-fill");
    if (!fill) return;
    fill.style.width = `${(value / max) * 100}%`;

    // Update text content too
    if (id === "humidity") {
      box.childNodes[0].textContent = `Humidity: ${value}%`;
    } else if (id === "pressure") {
      box.childNodes[0].textContent = `Pressure: ${value} hPa`;
    }
  }

  function getWindDirection(deg) {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(deg / 45) % 8];
  }

  function updateWindArrow(deg) {
    if (!windArrow) return;
    windArrow.style.transform = `rotate(${deg}deg)`;
  }

  function getForecast(lat, lon) {
    const api = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`;

    fetch(api)
      .then((res) => res.json())
      .then((data) => {
        const daily = {};

        data.list.forEach((entry) => {
          if (entry.dt_txt.includes("12:00:00")) {
            const date = new Date(entry.dt_txt).toDateString();
            daily[date] = entry;
          }
        });

        forecastContainer.innerHTML = "";
        Object.values(daily)
          .slice(0, 7)
          .forEach((day) => {
            forecastContainer.innerHTML += `
            <div class="forecast-day">
              <p><strong>${new Date(day.dt_txt).toLocaleDateString("en-US", {
                weekday: "short",
              })}</strong></p>
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

  // Unsplash API for city images
  function fetchCityImage(city) {
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === "YOUR_UNSPLASH_ACCESS_KEY") {
      // fallback to source.unsplash if no access key set
      cityPhoto.src = `https://source.unsplash.com/600x400/?${city},city`;
      cityPhoto.alt = `Image of ${city}`;
      return;
    }

    const url = `https://api.unsplash.com/search/photos?query=${city}&client_id=${UNSPLASH_ACCESS_KEY}&orientation=landscape&per_page=1`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results.length > 0) {
          cityPhoto.src = data.results[0].urls.regular;
          cityPhoto.alt = data.results[0].alt_description || `Image of ${city}`;
        } else {
          cityPhoto.src = `https://source.unsplash.com/600x400/?${city},city`;
          cityPhoto.alt = `Image of ${city}`;
        }
      })
      .catch(() => {
        cityPhoto.src = `https://source.unsplash.com/600x400/?${city},city`;
        cityPhoto.alt = `Image of ${city}`;
      });
  }

  // Auto refresh every 10 minutes (600000 ms)
  setInterval(() => {
    if (weather.city) {
      getWeatherByCity(weather.city);
    }
  }, 600000);
});
