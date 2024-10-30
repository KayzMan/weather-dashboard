import { Component } from "react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      city: "",
      weather: null,
      error: null,
      autocompleteCities: [],
      autocompleteErr: "",
    };
  }

  fetchWeatherData = () => {
    const { city } = this.state;

    if (!city) return;

    const apiKey = process.env.REACT_APP_API_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Couldn't fetch the weather data for this city!");
        }

        return response.json();
      })
      .then((data) => this.setState({ weather: data, error: null }))
      .catch((error) => this.setState({ error: error.message, weather: null }));
  };

  fetchPlace = async (text) => {
    console.log(process.env.REACT_APP_MAP_API_KEY);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=${process.env.REACT_APP_MAP_API_KEY}&cachebuster=1625641871908&autocomplete=true&types=place`
      );
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    } catch (err) {
      return { error: "Unable to retrieve places" };
    }
  };

  handleCityChange = async (event) => {
    this.setState({ city: event.target.value });

    const { city, autocompleteCities } = this.state;

    if (!city) return;

    const res = await this.fetchPlace(city);
    !autocompleteCities.includes(event.target.value) &&
      res.features &&
      this.setState({ autocompleteCities: res.features.map((place) => place.place_name) });

    res.error ? this.setState({ autocompleteErr: res.error }) : this.setState({ autocompleteErr: "" });
  };

  handleWeatherDataSubmit = (event) => {
    event.preventDefault();
    this.fetchWeatherData();
  };

  render() {
    const { city, weather, error, autocompleteCities, autocompleteErr } = this.state;

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Weather Dashboard</h1>

          <form className="mb-4 ">
            <div className="placesAutocomplete__inputWrap">
              <label htmlFor="city" className="label">
                {autocompleteErr && <span className="text-red-500 inputError">{autocompleteErr}</span>}
              </label>
              <br />

              <input
                list="places"
                type="text"
                placeholder="Enter city name."
                id="city"
                name="city"
                onChange={this.handleCityChange}
                value={city}
                required
                pattern={autocompleteCities.join("|")}
                autoComplete="off"
                className="border border-gray-300 rounded-lg py-2 px-4 w-full mb-4"
              />
              <datalist id="places" className="mt-5">
                {autocompleteCities.map((city, i) => (
                  <option key={i}>{city}</option>
                ))}
              </datalist>
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full hover:bg-blue-600"
              onClick={this.handleWeatherDataSubmit}
            >
              Get Weather Information
            </button>
          </form>

          {error && <p className="text-red-500 text-center">{error}</p>}

          {weather && (
            <div className="text-center flex items-center justify-center flex-col">
              <h2 className="text-xl font-semibold mb-2">{weather.name}</h2>

              <img
                src={"http://openweathermap.org/img/w/" + weather.weather[0].icon + ".png"}
                className="text-center w-20 h-20"
                alt={weather.weather[0].description}
              />

              <p className="text-gray-700">Temperature: {weather.main.temp}°C</p>
              <p className="text-gray-700">Weather: {weather.weather[0].description}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
