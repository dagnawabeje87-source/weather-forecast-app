import { describeWeatherCode } from "./weather.js";

const elements = {
  results: document.querySelector("#city-results"),
  status: document.querySelector("#status-panel"),
  dashboard: document.querySelector("#weather-dashboard"),
  weatherContent: document.querySelector("#weather-content"),
  searchButton: document.querySelector(".search-button"),
};

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function valueOrDash(value, suffix = "") {
  return Number.isFinite(value) ? `${Math.round(value)}${suffix}` : "—";
}

function formatCityLocation(city) {
  return [city.name, city.admin1, city.country].filter(Boolean).join(", ");
}

function formatDate(dateString, options) {
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

export function clearCityResults() {
  elements.results.replaceChildren();
}

export function showCityResults(cities, onSelect) {
  clearCityResults();
  elements.results.append(createElement("p", "results-heading", "Choose the right place"));

  cities.forEach((city) => {
    const button = createElement("button", "city-option");
    button.type = "button";
    const name = createElement("span", "city-option-name", city.name);
    const detail = createElement(
      "span",
      "city-option-detail",
      [city.admin1, city.country].filter(Boolean).join(", "),
    );
    button.append(name, detail);
    button.addEventListener("click", () => onSelect(city));
    elements.results.append(button);
  });
}

export function showLoading(message) {
  clearCityResults();
  elements.dashboard.hidden = true;
  elements.status.hidden = false;
  elements.status.className = "status-panel is-loading";
  elements.status.replaceChildren();
  elements.status.append(createElement("span", "spinner"));
  elements.status.setAttribute("role", "status");
  elements.status.append(createElement("h2", "", message));
  elements.status.append(createElement("p", "", "This should only take a moment."));
  elements.weatherContent.setAttribute("aria-busy", "true");
  elements.searchButton.disabled = true;
}

export function showMessage(title, message, isError = false) {
  clearCityResults();
  elements.dashboard.hidden = true;
  elements.status.hidden = false;
  elements.status.className = `status-panel${isError ? " is-error" : ""}`;
  elements.status.removeAttribute("role");
  elements.status.replaceChildren();
  const illustration = createElement("div", "empty-illustration");
  illustration.setAttribute("aria-hidden", "true");
  illustration.append(
    createElement("span", "empty-sun", isError ? "!" : "☀"),
    createElement("span", "empty-cloud", "☁"),
  );
  elements.status.append(illustration);
  elements.status.append(createElement("h2", "", title));
  elements.status.append(createElement("p", "", message));
  elements.weatherContent.setAttribute("aria-busy", "false");
  elements.searchButton.disabled = false;
}

function appendDetailCard(container, icon, label, value, unit) {
  const card = createElement("article", "detail-card");
  const iconElement = createElement("span", "detail-icon", icon);
  iconElement.setAttribute("aria-hidden", "true");
  const text = document.createElement("div");
  text.append(createElement("p", "detail-label", label));
  const valueElement = createElement("p", "detail-value");
  valueElement.append(document.createTextNode(value));
  if (unit && value !== "—") {
    valueElement.append(document.createTextNode(" "));
    valueElement.append(createElement("span", "detail-unit", unit));
  }
  text.append(valueElement);
  card.append(iconElement, text);
  container.append(card);
}

function renderCurrent(current, city) {
  const section = createElement("section", "current-card");
  section.setAttribute("aria-label", "Current weather");
  const copy = document.createElement("div");
  copy.append(createElement("p", "location-label", "CURRENT WEATHER"));
  copy.append(createElement("h2", "location-name", formatCityLocation(city)));
  copy.append(createElement(
    "p",
    "current-date",
    formatDate(current.time, { weekday: "long", month: "long", day: "numeric" }),
  ));
  const conditions = describeWeatherCode(current.weather_code);
  copy.append(createElement("p", "current-description", conditions.description));

  const temperatureWrap = createElement("div", "current-temperature-wrap");
  const icon = createElement("span", "weather-icon", conditions.icon);
  icon.setAttribute("role", "img");
  icon.setAttribute("aria-label", conditions.description);
  const temperatureColumn = document.createElement("div");
  const temperature = createElement("div", "current-temperature");
  temperature.append(document.createTextNode(valueOrDash(current.temperature_2m)));
  temperature.append(createElement("span", "temperature-unit", "°"));
  temperatureColumn.append(temperature, createElement("p", "current-label", "Temperature"));
  temperatureWrap.append(icon, temperatureColumn);
  section.append(copy, temperatureWrap);
  return section;
}

function renderDetails(current) {
  const grid = createElement("div", "detail-grid");
  grid.setAttribute("aria-label", "Weather details");
  appendDetailCard(grid, "🌡️", "Feels like", valueOrDash(current.apparent_temperature, "°"), "");
  appendDetailCard(grid, "💧", "Humidity", valueOrDash(current.relative_humidity_2m, "%"), "");
  appendDetailCard(grid, "💨", "Wind speed", valueOrDash(current.wind_speed_10m), "km/h");
  return grid;
}

function renderForecast(daily) {
  const section = createElement("section", "forecast-card");
  section.setAttribute("aria-labelledby", "forecast-title");
  const header = createElement("div", "forecast-header");
  header.append(createElement("h2", "", "5-day forecast"));
  header.firstElementChild.id = "forecast-title";
  header.append(createElement("p", "", "A look at the days ahead"));
  section.append(header);

  const list = createElement("div", "forecast-list");
  list.setAttribute("role", "list");
  const days = Array.isArray(daily.time) ? daily.time : [];
  days.forEach((date, index) => {
    const day = createElement("article", "forecast-day");
    day.setAttribute("role", "listitem");
    const conditions = describeWeatherCode(daily.weather_code?.[index]);
    day.append(createElement(
      "p",
      "forecast-day-name",
      index === 0 ? "Today" : formatDate(date, { weekday: "short" }),
    ));
    const icon = createElement("span", "forecast-icon", conditions.icon);
    icon.setAttribute("role", "img");
    icon.setAttribute("aria-label", conditions.description);
    day.append(icon);
    day.append(createElement("p", "forecast-condition", conditions.description));
    const temps = createElement("p", "forecast-temps");
    temps.append(document.createTextNode(valueOrDash(daily.temperature_2m_max?.[index], "°")));
    temps.append(createElement(
      "span",
      "forecast-low",
      valueOrDash(daily.temperature_2m_min?.[index], "°"),
    ));
    day.append(temps);
    const precipitation = daily.precipitation_probability_max?.[index];
    if (Number.isFinite(precipitation)) {
      day.append(createElement("p", "precipitation", `☂ ${Math.round(precipitation)}%`));
    }
    list.append(day);
  });

  if (days.length === 0) {
    list.append(createElement("p", "forecast-condition", "Forecast data is unavailable."));
  }
  section.append(list);
  return section;
}

export function renderWeather(data, city) {
  clearCityResults();
  elements.status.hidden = true;
  elements.dashboard.replaceChildren();
  const current = data.current ?? {};
  const daily = data.daily ?? {};
  elements.dashboard.append(
    renderCurrent(current, city),
    renderDetails(current),
    renderForecast(daily),
  );
  elements.dashboard.hidden = false;
  elements.weatherContent.setAttribute("aria-busy", "false");
  elements.searchButton.disabled = false;
}
