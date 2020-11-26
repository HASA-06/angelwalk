const express = require('express');
const router = express.Router();
const async = require('async');

const rds = require('../../../../privateModules/amazonWebService/rds');
const crawling = require('../../../../privateModules/crawling');

router.get('/', (req, res) => {
	let detailTouristAttractionTaskArray = [
		(callback) => {
			crawling.detailTouristAttraction('/amenity/sights/sightsDetail.jsp?Depth=1111&seq=12', (error, result) => {
				if(error) {
					callback('Crawling error : ' + error);
				} else {
					callback(null, result);
				}
			});
		},
		(data, callback) => {
			console.log(data);
		}
	];

	async.waterfall(detailTouristAttractionTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;