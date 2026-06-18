import { useEffect, useRef, useState } from 'react';
import './App.css';

const DEFAULT_CITY = 'New York';
const API_BASE_URL = process.env.REACT_APP_OPENWEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5/weather';

function App() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const controllerRef = useRef(null);

  const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;

  // window width display removed per UI preference

  useEffect(() => {
    document.title = weather ? `${weather.city} weather • Weather Dashboard` : 'Weather Dashboard';
  }, [weather]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!city) {
        setError('Please enter a city name before fetching weather.');
        setStatus('error');
        setWeather(null);
        return;
      }

      if (!apiKey) {
        setError('API key missing. Add REACT_APP_OPENWEATHER_API_KEY to .env');
        setStatus('error');
        setWeather(null);
        return;
      }

      setStatus('loading');
      setError('');
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const url = `${API_BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
        if (process.env.NODE_ENV === 'development') {
          // dev-only: print request URL (helps debug invalid key / endpoint)
          // eslint-disable-next-line no-console
          console.log('fetching weather URL:', url);
        }

        const response = await fetch(url, { signal: controller.signal });

        const contentType = response.headers.get('content-type') || '';
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('weather response status:', response.status, 'content-type:', contentType);
        }
        if (!contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(
            `Server returned non-JSON response (status ${response.status}): ${text.slice(0,200)}`
          );
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || `Unable to fetch weather data (status ${response.status}).`);
        }

        setWeather({
          city: data.name,
          country: data.sys?.country || '',
          description: data.weather?.[0]?.description || 'Unknown',
          temperature: Math.round(data.main?.temp || 0),
          humidity: data.main?.humidity || 0,
          windSpeed: data.wind?.speed || 0,
          icon: data.weather?.[0]?.icon || '',
        });
        setStatus('success');
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message);
          setStatus('error');
          setWeather(null);
        }
      }
    };

    fetchWeather();
    const intervalId = setInterval(fetchWeather, 60000);

    return () => {
      controllerRef.current?.abort();
      clearInterval(intervalId);
    };
  }, [city, apiKey]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setCity(trimmed);
    setQuery('');
  };

  return (
    <div className="weather-app">
      <header className="weather-header">
        <p className="weather-eyebrow">Weather Dashboard</p>
        <h1>Live Weather</h1>
        <p className="weather-description">
          Search a city to view its weather</p>
      </header>

      <section className="weather-controls">
        <form className="weather-form" onSubmit={handleSearchSubmit}>
          <label htmlFor="city-search" className="weather-label">
            Search city
          </label>
          <div className="weather-search-row">
            <input
              id="city-search"
              className="weather-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter city name"
              aria-label="City name"
            />
            <button className="weather-button" type="submit">
              Get Weather
            </button>
          </div>
        </form>

        <div className="weather-meta">
          <p>Current request city: <strong>{city}</strong></p>
        </div>
      </section>

      <section className="weather-status-panel">
        {status === 'loading' && <p className="status-message">Loading weather data…</p>}
        {status === 'error' && <p className="status-message error-message">{error}</p>}
      </section>

      {status === 'success' && weather && (
        <section className="weather-card">
          <div className="weather-card-main">
            <div>
              <h2>{weather.city}, {weather.country}</h2>
              <p className="weather-condition">{weather.description}</p>
            </div>
            <div className="weather-temp">{weather.temperature}°C</div>
          </div>

          <div className="weather-details">
            <div className="detail-item">
              <span>Humidity</span>
              <strong>{weather.humidity}%</strong>
            </div>
            <div className="detail-item">
              <span>Wind speed</span>
              <strong>{weather.windSpeed} m/s</strong>
            </div>
            <div className="detail-item">
              <span>Next refresh</span>
              <strong>60 seconds</strong>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
