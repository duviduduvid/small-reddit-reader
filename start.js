const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = 8080;
app.use(bodyParser.json());
app.use(express.static('.'));

app.listen(port, () => console.info(`small-reddit-reader server is running on port ${port}`)); 