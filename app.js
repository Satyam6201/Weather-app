const API_KEY = "YOUR_OPENWEATHER_API_KEY";
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const cityListEl = document.getElementById("city-list");
const loader = document.getElementById("loader");

// ==== Feature 1: Live Clock ====
function updateClock() {
  const now = new Date();
  const clock = document.getElementById("live-clock");
  clock.textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// ==== Feature 2: Search Weather ====
searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city) getWeatherData(city);
});

// ==== Feature 3: Fetch Weather Data ====
async function getWeatherData(city) {
  try {
    loader.style.display = "block";

    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const weatherRes = await fetch(weatherURL);
    const weatherData = await weatherRes.json();

    const lat = weatherData.coord.lat;
    const lon = weatherData.coord.lon;

    const oneCallURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${API_KEY}&units=metric`;
    const oneCallRes = await fetch(oneCallURL);
    const oneCallData = await oneCallRes.json();

    updateWeatherUI(weatherData, oneCallData);
    fetchCityPhoto(city);
    saveCity(city);
    loader.style.display = "none";
  } catch (error) {
    alert("City not found or API error.");
    loader.style.display = "none";
  }
}

// ==== Feature 4: Update Weather UI ====
function updateWeatherUI(data, oneCall) {
  document.querySelector(".temperature-value p").innerHTML =
    `${Math.round(data.main.temp)}°<span>C</span>`;
  document.querySelector(".temperature-description p").textContent =
    data.weather[0].description;
  document.querySelector(".location p").textContent =
    `${data.name}, ${data.sys.country}`;
  document.querySelector(".wind-speed p").textContent =
    `Wind: ${data.wind.speed} km/h`;
  document.querySelector("#feels-like").textContent =
    `Feels Like: ${data.main.feels_like}°C`;
  document.querySelector("#humidity").innerHTML =
    `Humidity: ${data.main.humidity}%<div class="progress-bar"><div class="progress-bar-fill" style="width:${data.main.humidity}%"></div></div>`;
  document.querySelector("#pressure").innerHTML =
    `Pressure: ${data.main.pressure} hPa<div class="progress-bar"><div class="progress-bar-fill" style="width:${data.main.pressure / 10}%"></div></div>`;
  document.querySelector("#sunrise").textContent =
    `Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}`;
  document.querySelector("#sunset").textContent =
    `Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;
  document.querySelector("#wind-direction").innerHTML =
    `Direction: ${data.wind.deg}°<br/><svg id="wind-arrow" style="transform: rotate(${data.wind.deg}deg)" width="24" height="24"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
  document.querySelector(".weather-icon img").src =
    `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  // Feature 5: Animated Temperature Change
  document.querySelector(".temperature-value p").style.transition = "0.5s";

  // Feature 6: AQI (Air Quality Index)
  fetchAQI(data.coord.lat, data.coord.lon);

  // Feature 7: Hourly Forecast
  showHourlyForecast(oneCall.hourly);
}

// ==== Feature 8: Fetch AQI ====
async function fetchAQI(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
  const aqiData = await res.json();
  const aqiVal = aqiData.list[0].main.aqi;
  const levels = ["Good 😃", "Fair 🙂", "Moderate 😐", "Poor 😷", "Very Poor ☠️"];
  document.getElementById("aqi-box").textContent = `Air Quality Index: ${aqiVal} (${levels[aqiVal - 1]})`;
}

// ==== Feature 9: Hourly Forecast ====
function showHourlyForecast(hourlyData) {
  const container = document.getElementById("hourly-forecast");
  container.innerHTML = "";
  hourlyData.slice(0, 12).forEach(hour => {
    const div = document.createElement("div");
    div.className = "hour";
    div.innerHTML = `
      <p>${new Date(hour.dt * 1000).getHours()}:00</p>
      <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}.png"/>
      <p>${Math.round(hour.temp)}°C</p>
    `;
    container.appendChild(div);
  });
}

// ==== Feature 10: Save Favorite Cities ====
function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem("cities", JSON.stringify(cities));
    renderSavedCities();
  }
}

function renderSavedCities() {
  const cities = JSON.parse(localStorage.getItem("cities")) || [];
  cityListEl.innerHTML = "";
  cities.forEach(city => {
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.addEventListener("click", () => getWeatherData(city));
    cityListEl.appendChild(btn);
  });
}
renderSavedCities();

// ==== Feature 11: City Photo ====
function fetchCityPhoto(city) {
  const img = document.getElementById("city-photo");
  img.src = `https://source.unsplash.com/800x400/?${city},cityscape`;
}

// Optional: Toggle Dark Mode
document.getElementById("toggle-mode").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
