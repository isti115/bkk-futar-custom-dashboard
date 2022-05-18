const formatTimeHHMM = date => `
${`${date.getHours()}`.padStart(2, '0')}
:
${`${date.getMinutes()}`.padStart(2, '0')}
`.replace(/[\r\n ]/g, '')

const formatTimeMMSS = date => `
${`${date.getMinutes()}`.padStart(2, '0')}
:
${`${date.getSeconds()}`.padStart(2, '0')}
`.replace(/[\r\n ]/g, '')

const delaySteps = [1000, 300, 120, 60, -60, -120, -300, -1000]

const makeDelayStep = (from, to, delay) => /* html */ `
  <div class="delay-marker ${delay <= from && delay >= to ? 'bright' : 'dim'}">_</div>
`

// top: ${20 + (delay === 0 ? 0 : (Math.sign(delay) * Math.log2(Math.abs(delay / 60))))}px;
const makeIndicatorStyle = delay => `
  top: ${35 + delay / 60 * 2.5}px;
  color: ${delay < 0 ? '#d232d2' : (delay > 0 ? '#4242ee' : 'white')};
`

const makeDelayDisplay = delay => /* html */ `
<div class="delay-container">
  ${delaySteps.slice(1).map(
    (_, i) => makeDelayStep(delaySteps[i], delaySteps[i + 1], 0)
    // (_, i) => makeDelayStep(delaySteps[i], delaySteps[i + 1], delay)
  ).join('\n')}
  <div
    class="delay-indicator"
    data-delay="${delay}"
    style="${makeIndicatorStyle(-delay)}"
  >
  <!-- · -->
  ▶
  </div>
</div>
`

const formatDeparture = d => /* html */ `
<tr class="departure">
  <td><span class="name" data-name="${d.name}">${d.name}</span></td>
  <td class="${
  [
    'relativeTime',
    d.isPredicted ? 'live' : '',
    d.time - Date.now() < 0 ? 'gone' : ''
  ].join(' ')}"
    data-delay="${d.delay}"
  >
    <span>${formatTimeMMSS(new Date(Math.abs(d.time - Date.now())))}</span>
  </td>
  <td class="delay-display">
    ${makeDelayDisplay(d.delay)}
  </td>
  <td class="absoluteTime" >${formatTimeHHMM(new Date(d.time)).replace(':', '\n')}</td>
  <!-- <td class="delay" >
    ${d.delay}
  </td> -->
</tr>
`

const formatDepartures = (name, departures) => /* html */ `
<table class="departures">
  <thead><tr><td colspan="4">${name}</td></tr></thead>
  <tbody>
    ${departures.map(formatDeparture).join('\n')}
  </tbody>
</table>
`

const makeDate = () => {
  const d = new Date()
  return [
    `${d.getHours()}`.padStart(2, '0'),
    `${d.getMinutes()}`.padStart(2, '0'),
    `${d.getSeconds()}`.padStart(2, '0')
  ].join(':')
}

// eslint-disable-next-line no-unused-vars
const makeContent = (app) => /* html */ `
<div id="container">
  <div id="top">
    <div id="weather">
      ${app.data.currentTemperature}°C
    </div>
    <div id="updateLightContainer">
      <!-- <progress max="100" value="${(Date.now() - app.lastUpdate) / 50}">
      </progress> -->
      <div class="updateLight ${Date.now() - app.lastUpdate > 1000 ? 'on' : 'off'}"></div>
      <div class="updateLight ${Date.now() - app.lastUpdate > 2000 ? 'on' : 'off'}"></div>
      <div class="updateLight ${Date.now() - app.lastUpdate > 3000 ? 'on' : 'off'}"></div>
      <div class="updateLight ${Date.now() - app.lastUpdate > 4000 ? 'on' : 'off'}"></div>
    </div>
    <div id="clock">
      ${makeDate()}
    </div>
  </div>
  <div id="departuresContainer">
    ${formatDepartures(app.data.leftText, app.data.departuresToWest)}
    ${formatDepartures(app.data.rightText, app.data.departuresToEast)}
  </div>
</div>
`
