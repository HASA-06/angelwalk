const express = require('express');
const router = express.Router();

const detailRouter = require('./detail');

router.use('/detail', detailRouter);

module.exports = router;