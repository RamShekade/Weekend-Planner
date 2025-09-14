// weather.js
// Usage: import { checkWeatherForOutdoorActivity } from "../functions/weather";

const OPENWEATHER_API_KEY = "45f2261b0c20880c11bd96d4b1d61659"; // <-- Replace with your key

/**
 * Checks if weather is suitable for an outdoor activity at a given place and date.
 * @param {Object} options
 * @param {number} options.lat - Latitude
 * @param {number} options.lon - Longitude
 * @param {Date|string} options.date - Date string (YYYY-MM-DD or Date object)
 * @returns {Promise<{ok: boolean, weather: string, details: object}>}
 * - ok: true if weather is suitable, false otherwise
 * - weather: e.g., "Rain", "Clear", etc.
 * - details: full forecast object
 */
export async function checkWeatherForOutdoorActivity({ lat, lon, date }) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather");
  const data = await res.json();

  // Find the forecast most closely matching the date
  const inputDate = new Date(date);
  inputDate.setHours(12, 0, 0, 0);
  const target = Math.floor(inputDate.getTime() / 1000);

  // Find the forecast day closest to the target date (OpenWeather gives next 7 days)
  let best = data.daily[0];
  let minDiff = Math.abs(data.daily[0].dt - target);
  data.daily.forEach(forecast => {
    const diff = Math.abs(forecast.dt - target);
    if (diff < minDiff) {
      minDiff = diff;
      best = forecast;
    }
  });

  const weatherMain = best.weather[0].main; // e.g. "Rain", "Clear", "Clouds"
  const goodWeather = !["Rain", "Thunderstorm", "Snow"].includes(weatherMain);

  return {
    ok: goodWeather,
    weather: weatherMain,
    details: best
  };
}