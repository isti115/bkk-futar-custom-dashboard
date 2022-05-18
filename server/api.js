const request = require('request')

const bkkApiPath = 'https://futar.bkk.hu/api/query/v1/ws/otp/api/where'
const weatherApiPath = 'https://api.openweathermap.org/data/2.5'

const makeGetParameters = getParameters => (
  Object.keys(getParameters).map(k => `${k}=${getParameters[k]}`).join('&')
)

const makeRequest = (apiPath, apiFunction, getParameters) => {
  // console.log(`${apiPath}/${apiFunction}?${makeGetParameters(getParameters)}`)
  return new Promise((resolve, reject) => {
    request(
      `${apiPath}/${apiFunction}?${makeGetParameters(getParameters)}`,
      { json: true },
      (err, res, body) => {
        if (err) {
          reject(err)
        }

        resolve(body)
      }
    )
  })
}

module.exports = {
  bkk: {
    getSchedule: async (stopId) => {
      const getParameters = {
        stopId,
        onlyDepartures: true
      }

      const response = await makeRequest(
        bkkApiPath,
        'schedule-for-stop.json',
        getParameters
      )
      return response
    },
    getDepartures: async (stopId) => {
      const getParameters = {
        stopId,
        onlyDepartures: true,
        minutesBefore: 2,
        minutesAfter: 60
      }

      const response = await makeRequest(
        bkkApiPath,
        'arrivals-and-departures-for-stop.json',
        getParameters
      )

      const references = response.data.references
      const stopTimes = response.data.entry.stopTimes

      const departures = stopTimes.map(st => ({
        name: references.routes[references.trips[st.tripId].routeId].shortName,
        time: (st.predictedDepartureTime || st.departureTime) * 1000,
        delay: st.departureTime - (st.predictedDepartureTime || st.departureTime),
        isPredicted: st.hasOwnProperty('predictedDepartureTime')
      }))

      return departures
    },
    processDeparture: departure => ({
      relativeTime: ''
    })
  },
  weather: {
    getCurrentTemperature: async (apiKey, city) => {
      const getParameters = {
        q: city,
        units: 'metric',
        APPID: apiKey
      }

      const response = await makeRequest(
        weatherApiPath,
        'weather',
        getParameters
      )

      return response.main.temp
    }
  }
}
