'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = Date.now().toString().slice(-10);

  constructor(distance, duration, coords) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    console.log(this.name);
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.name[0].toUpperCase()}${this.name.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, name, cadence) {
    super(distance, duration, coords);
    this.name = name;
    this.cadence = cadence;
    this._calcPace();
    this._setDescription();
  }
  _calcPace() {
    this.pace = +(this.duration / this.distance);
    
    return this.pace
    
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, name, elevationGain) {
    super(distance, duration, coords);
    this.name = name;
    this.elevationGain = elevationGain;
    this._calcSpeed();
    this._setDescription();
  }
  _calcSpeed() {
    this.pace = this.duration / this.distance;
    return this.pace
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('no location found');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    let workout;
    const { lat, lng } = this.#mapEvent.latlng;
    //helper function
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const validInputsPositive = (...inputs) => inputs.every(inp => inp > 0);
    e.preventDefault();
    // inputDistance.value =
    //   inputCadence.value =
    //   inputElevation.value =
    //   inputDuration.value =
    //     '';

    // take all inputs from forms
    const name = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    console.log(distance);
    if (name == 'running') {
      // check values are valid
      const cadence = +inputCadence.value;
      if (
        !validInputs(distance, duration, cadence) ||
        !validInputsPositive(distance, duration, cadence)
      ) {
        return alert('Positive Numbers Only!');
      }
      workout = new Running(
        [lat, lng],
        distance,
        duration,
        name,
        cadence
      );
    }

    if (name == 'cycling') {
      // check values are valid
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !validInputsPositive(distance, duration)
      ) {
        return alert('Positive Numbers Only!');
      }
      workout = new Cycling(
        [lat, lng],
        distance,
        duration,
        name,
        elevation
      );
    }
    this.#workouts.push(workout);
    this._setPointer(workout);
    this._renderWorkout(workout)

  }
  
  _renderWorkout(workout) {
    
    let html = `
      <li class="workout workout--${workout.name}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.name === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.name === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

    if (workout.name === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;

    form.insertAdjacentHTML('afterend', html);
  }



  _setPointer(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: `${workout.name}-popup`,
        })
      )
      .setPopupContent(
        `${workout.name === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.name}`
      )
      .openPopup();
  }
}

const app = new App();

