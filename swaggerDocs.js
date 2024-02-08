const router = require('express').Router();

const path = require('path');
const yamljs = require('yamljs');
// const YAML = require('yamljs');

const swaggerUi = require('swagger-ui-express');

// const swaggerDocument = yamljs.load(path.resolve(`./swagger.yaml`));
const swaggerDocument = yamljs.load(path.resolve(`${__dirname}/swagger.yaml`))

// const swaggerDocument = YAML.load('./swagger.yaml');
// const router = Router();

//swaggerDocument.host = `${process.env.APP_URL}:${process.env.PORT}`;

router.get('/docs.json', (req, res) => res.send(swaggerDocument));
router.use('/docs', swaggerUi.serve, (req, res) => res.send(swaggerUi.generateHTML(swaggerDocument)));
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


module.exports = router;    