import { getForecast, searchCities } from "./weather.js";
import {
  clearCityResults,
  renderWeather,
  showCityResults,
  showLoading,
  showMessage,
} from "./ui.js";

const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
let requestId = 0;

async function loadCityWeather(city, activeRequestId) {
  showLoading(`Getting the forecast for ${city.name}...`);

  try {
    const forecast = await getForecast(city.latitude, city.longitude);
    if (activeRequestId !== requestId) return;
    renderWeather(forecast, city);
  } catch (error) {
    if (activeRequestId !== requestId) return;
    const message = error instanceof Error
      ? error.message
      : "Something went wrong while loading the forecast. Please try again.";
    showMessage("We couldn't load that forecast", message, true);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const cityName = cityInput.value.trim();

  if (!cityName) {
    clearCityResults();
    showMessage("Enter a city to get started", "Type a city name in the search box, then try again.");
    cityInput.focus();
    return;
  }

  const activeRequestId = ++requestId;
  showLoading(`Searching for ${cityName}...`);

  try {
    const cities = await searchCities(cityName);
    if (activeRequestId !== requestId) return;
    if (cities.length === 0) {
      showMessage("No cities found", `We couldn't find “${cityName}”. Check the spelling and try another search.`);
      return;
    }

    if (cities.length === 1) {
      await loadCityWeather(cities[0], activeRequestId);
      return;
    }

    showMessage("Choose a location", "Select the city or region that matches your search.");
    showCityResults(cities, (city) => loadCityWeather(city, activeRequestId));
  } catch (error) {
    if (activeRequestId !== requestId) return;
    const message = error instanceof Error
      ? error.message
      : "Something went wrong while searching. Please try again.";
    showMessage("We couldn't search right now", message, true);
  }
});
