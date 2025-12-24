const API_KEY = "534aadf9e6550b59a3da634d2688923e";
const el = id => document.getElementById(id);
const loader = el("loader");

let isCelsius = true;

/* 🌙 Dark Mode */
if (localStorage.getItem("mode") === "dark") {
  document.body.classList.add("dark");
}

el("toggle-mode").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("mode",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
};

/* 📍 Auto Location */
window.onload = () => {
  navigator.geolocation
    ? navigator.geolocation.getCurrentPosition(
        pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather("Delhi")
      )
    : fetchWeather("Delhi");
};

el("search-btn").onclick = () => fetchWeather(el("search-input").value);

function showLoader(v) {
  loader.style.display = v ? "block" : "none";
}

function fetchWeather(city) {
  if (!city) return;
  showLoader(true);
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
    .then(r => r.json())
    .then(updateUI)
    .catch(() => notify("City not found"))
    .finally(() => showLoader(false));
}

function fetchByCoords(lat, lon) {
  showLoader(true);
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    .then(r => r.json())
    .then(updateUI)
    .finally(() => showLoader(false));
}

function updateUI(d) {
  el("weather-icon").src = `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`;
  el("temp").textContent = `${Math.round(d.main.temp)}°C`;
  el("desc").textContent = d.weather[0].description;
  el("location").textContent = `${d.name}, ${d.sys.country}`;
  el("time").textContent = new Date().toLocaleString();

  el("feels").textContent = Math.round(d.main.feels_like);
  el("humidity").textContent = d.main.humidity;
  el("pressure").textContent = d.main.pressure;
  el("wind").textContent = d.wind.speed;
  el("min").textContent = Math.round(d.main.temp_min);
  el("max").textContent = Math.round(d.main.temp_max);

  el("arrow").style.transform = `rotate(${d.wind.deg}deg)`;

  fetchForecast(d.coord.lat, d.coord.lon);
}

/* 🌡 Temperature Toggle */
el("temp").onclick = () => {
  let t = parseFloat(el("temp").textContent);
  el("temp").textContent = isCelsius
    ? `${Math.round(t * 9/5 + 32)}°F`
    : `${Math.round((t - 32) * 5/9)}°C`;
  isCelsius = !isCelsius;
};

/* 📅 Forecast */
function fetchForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    .then(r => r.json())
    .then(d => {
      el("forecast").innerHTML = "";
      d.list.filter(i => i.dt_txt.includes("12:00")).slice(0,5)
        .forEach(day => {
          el("forecast").innerHTML += `
            <div class="card">
              <p>${new Date(day.dt_txt).toLocaleDateString("en",{weekday:"short"})}</p>
              <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
              <p>${Math.round(day.main.temp)}°C</p>
            </div>`;
        });
    });
}