const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const forecastContainer = document.querySelector(".forecast-container");
const forecast = document.querySelector(".forecast");
const unitToggle = document.querySelector(".unit-toggle");

//initially variables
let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
let currentUnit = "metric";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
  if (newTab != oldTab) {
    oldTab.classList.remove("current-tab");
    oldTab = newTab;
    oldTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      // Show search form
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
      forecastContainer.classList.remove("active");
    } else {
      // Show user weather info
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      getfromSessionStorage();
    }
  }
}

userTab.addEventListener("click", () => {
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  switchTab(searchTab);
});

unitToggle.addEventListener("click", () => {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
  unitToggle.textContent =
    currentUnit === "metric" ? "Switch to °F" : "Switch to °C";
  getfromSessionStorage();
});

function getfromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    grantAccessContainer.classList.add("active");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  grantAccessContainer.classList.remove("active");
  loadingScreen.classList.add("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`
    );
    const data = await response.json();

    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);

    fetchForecastWeatherInfo(lat, lon);
  } catch (err) {
    loadingScreen.classList.remove("active");
  }
}

function renderWeatherInfo(weatherInfo) {
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${weatherInfo?.main?.temp} °${
    currentUnit === "metric" ? "C" : "F"
  }`;
  windspeed.innerText = `${weatherInfo?.wind?.speed} ${
    currentUnit === "metric" ? "m/s" : "mph"
  }`;
  humidity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

async function fetchForecastWeatherInfo(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`
    );
    const data = await response.json();
    renderForecastInfo(data);
  } catch (err) {
    // Handle error
  }
}

function renderForecastInfo(forecastInfo) {
  forecast.innerHTML = "";
  const dailyData = forecastInfo.list.filter((reading) =>
    reading.dt_txt.includes("18:00:00")
  );
  dailyData.forEach((day) => {
    const dayElement = document.createElement("div");
    dayElement.classList.add("forecast-day");
    dayElement.innerHTML = `
            <p>${new Date(day.dt_txt).toLocaleDateString()}</p>
            <img src="http://openweathermap.org/img/w/${
              day.weather[0].icon
            }.png" alt="${day.weather[0].description}">
            <p>${day.main.temp} °${currentUnit === "metric" ? "C" : "F"}</p>
        `;
    forecast.appendChild(dayElement);
  });
  forecastContainer.classList.add("active");
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };

  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let cityName = searchInput.value;

  if (cityName === "") return;
  else fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grantAccessContainer.classList.remove("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`
    );
    const data = await response.json();
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {
    // Handle error
  }
}
