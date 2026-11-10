const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather service returned an error (${response.status}). Please try again.`);
  }

  return response.json();
}

export async function searchCities(cityName) {
  const url = new URL(GEOCODING_URL);
  url.search = new URLSearchParams({
    name: cityName,
    count: "5",
    language: "en",
    format: "json",
  });

  const data = await fetchJson(url);
  return Array.isArray(data.results) ? data.results : [];
}

export async function getForecast(latitude, longitude) {
  const url = new URL(FORECAST_URL);
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
    ].join(","),
    timezone: "auto",
    forecast_days: "5",
  });

  return fetchJson(url);
}

export function describeWeatherCode(code) {
  const weather = {
    0: { description: "Clear sky", icon: "☀️" },
    1: { description: "Mainly clear", icon: "🌤️" },
    2: { description: "Partly cloudy", icon: "⛅" },
    3: { description: "Overcast", icon: "☁️" },
    45: { description: "Fog", icon: "🌫️" },
    48: { description: "Rime fog", icon: "🌫️" },
    51: { description: "Light drizzle", icon: "🌦️" },
    53: { description: "Drizzle", icon: "🌦️" },
    55: { description: "Heavy drizzle", icon: "🌧️" },
    56: { description: "Freezing drizzle", icon: "🌧️" },
    57: { description: "Heavy freezing drizzle", icon: "🌧️" },
    61: { description: "Light rain", icon: "🌦️" },
    63: { description: "Rain", icon: "🌧️" },
    65: { description: "Heavy rain", icon: "🌧️" },
    66: { description: "Freezing rain", icon: "🌧️" },
    67: { description: "Heavy freezing rain", icon: "🌧️" },
    71: { description: "Light snow", icon: "🌨️" },
    73: { description: "Snow", icon: "🌨️" },
    75: { description: "Heavy snow", icon: "❄️" },
    77: { description: "Snow grains", icon: "🌨️" },
    80: { description: "Light showers", icon: "🌦️" },
    81: { description: "Rain showers", icon: "🌧️" },
    82: { description: "Heavy showers", icon: "🌧️" },
    85: { description: "Snow showers", icon: "🌨️" },
    86: { description: "Heavy snow showers", icon: "❄️" },
    95: { description: "Thunderstorm", icon: "⛈️" },
    96: { description: "Thunderstorm with hail", icon: "⛈️" },
    99: { description: "Heavy thunderstorm with hail", icon: "⛈️" },
  };

  return weather[code] ?? { description: "Conditions unavailable", icon: "🌡️" };
}
