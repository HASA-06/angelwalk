const express = require('express');
const router = express.Router();
const async = require('async');

const rds = require('../../../../privateModules/amazonWebService/rds');
const crawling = require('../../../../privateModules/crawling');

router.get('/:pageCount', (req, res) => {
	let pageCount = req.params.pageCount;
	let category = req.query.category;
	let touristAttractionCategoryTaskArray = [
		(callback) => {
			crawling.touristAttraction(category, pageCount, (error, result) => {
				if(error) {
					callback('Crawling error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Crawling error : ' + error
					});
				} else {
					callback(null, result);
				}
			});
		},
		(touristAttractionInfo, callback) => {
			rds.createConnect.getConnection((error, result) => {
				if(error) {
					callback('RDS connect fail : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'RDS connect fail : ' + error
					});
				} else callback(null, touristAttractionInfo, result);
			});
		},
		(touristAttractionInfo, connection, callback) => {
			let insertTouristAttractionQuery = 'insert into TouristAttraction values (?, ?, ?, ?, ?)';

			for(let i = 0; i < touristAttractionInfo.length; i++) {
				connection.query(insertTouristAttractionQuery, [null, touristAttractionInfo[i].category, touristAttractionInfo[i].name, touristAttractionInfo[i].address, touristAttractionInfo[i].detailLink], (error) => {
					if(error) {
						connection.release();

						callback('Insert tourist-attraction query error : ' + error);
					} else if(i === touristAttractionInfo.length - 1) {
						connection.release();

						callback(null, 'Input tourist-attraction success');

						res.status(200).send({
							stat : ' Success',
							msg : 'Input tourist-attraction success'
						});
					} else {
					}
				});
			};
		}
	];

	async.waterfall(touristAttractionCategoryTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;