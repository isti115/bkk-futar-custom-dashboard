/* exported simplePage */

// eslint-disable-next-line no-unused-vars
const simplePage = text => /* html */ `
  <style>
    body {
      background-color: black;
      color: white;
    }

    div#container {
      display: flex;

      flex-direction: column;
      justify-content: center;

      width: 100%;
      height: 100%;
    }

    div#content {
      font-size: 30px;
      text-align: center;

      /* white-space: pre; */
    }
  </style>
  <div id="container">
    <div id="content">
      ${text}
    </div>
  </div>
`
