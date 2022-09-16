/* global simplePage makeContent */

window.addEventListener('load', () => {
  document.body.addEventListener('click', () => {
    // window.location.reload()
    // window.alert('installing')
    document.body.requestFullscreen()
    // navigator.mozApps.install(window.location.href + 'manifest.webapp.json')
  })

  const app = {
    paused: true,
    lastUpdate: Date.now(),
    data: {
      leftText: '',
      rightText: '',
      departuresToWest: [],
      departuresToEast: [],
      currentTemperature: '???'
    }
  }

  app.connect = () => {
    app.ws = new window.WebSocket(`ws://${window.location.host}`)

    // app.ws.addEventListener('connect', () => {
    //   document.body.innerHTML = 'Connected successfully! :)'
    // })

    app.ws.addEventListener('message', message => {
      const parsedMessage = JSON.parse(message.data)

      if (parsedMessage.type === 'connected') {
        document.body.innerHTML = simplePage('Connected successfully! :)')
        app.paused = false
        setTimeout(() => app.update(), 3000)
      } else if (parsedMessage.type === 'reload') {
        window.location.reload()
      } else if (parsedMessage.type === 'data') { // && !app.paused) {
        app.data = parsedMessage.data
        // console.log(parsedMessage)
        app.lastUpdate = Date.now()
      }
    })
  }

  app.checkConnection = () => {
    // readyState 1 : OPEN
    if (app.ws.readyState !== 1) {
      // alert(`readyState: ${app.ws.readyState}`)
      document.body.innerHTML = simplePage('Connection lost,<br />trying to reconnect...')
      app.paused = true
      app.connect()
    }
  }

  app.update = () => {
    document.body.innerHTML = makeContent(app)
    if (!app.paused) { setTimeout(() => app.update(), 1000) }
  }

  app.connect()
  app.connectionCheckInterval = setInterval(() => app.checkConnection(), 5000)

  window.app = app
})
