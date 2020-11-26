const request = require('request');
const jschardet = require('jschardet');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const phantom = require('phantom');
const async = require('async');

module.exports.touristAttraction = function(category, pageCount, callbackFunction) {
	let data = [];
	let idOfData = 0;

	urlCategory = {
		'고궁' : 1111,
		'공원' : 1211,
		'유적지문화재' : 1311,
		'박물관미술관' : 1411
	};

	for(let i = 0; i < pageCount; i++) {
		request.get({uri : 'https://disability.seoul.go.kr/amenity/sights/sights.jsp?pagenum=' + (i + 1) + '&Depth=' + urlCategory[category] + '&fDepth=1&sDepth=2&sortName=1', encoding : null}, (error, response, body) => {
			if(error) {
				callbackFunction('Crawling tourist attraction error : ' + error, null);
			} else if(response.statusCode === 200) {
				let buffer = new Buffer(body);
				let decodedBody = iconv.decode(buffer, 'EUC-KR');
				let $ = cheerio.load(decodedBody);

				$('#cwrap > div.board > ul.travel-list > li').each((index, element) => {
					let name = $(element).find('li > dl > dt').children('a').first().text();
					let addressIndex = $(element).find('li > dl > dd > span.loc').text().lastIndexOf('주');
					let address = $(element).find('li > dl > dd > span.loc').text().substr(addressIndex).trim().replace(/\t|\n|\s+/g, " ");
					let detailLink = $(element).find('li > p.thum > a').attr('href');
					let categoryData = category;

					data[idOfData++] = {
						'category' : categoryData,
						'name' : name,
						'address' : address,
						'detailLink' : detailLink
					};
				});
			}

			if(i === pageCount - 1) {
				callbackFunction(null, data);
			}
		});
	}
};

module.exports.detailTouristAttraction = function(touristAttractionLink, callbackFunction) {
	/*let detailTouristAttractionInfoJSON = {};

	request.get({uri : 'http://disability.seoul.go.kr' + touristAttractionLink, encoding : null}, (error, response, body) => {
		if(error) {
			callbackFunction('Crawling detail tourist-attraction fail : ' + error, null);
		} else if(response.statusCode === 200) {
			let buffer = new Buffer(body);
			let decodedBody = iconv.decode(buffer, 'EUC-KR');
			let $ = cheerio.load(decodedBody);

			detailTouristAttractionInfoJSON.imageURL = $('#cwrap > div.board > div.imgIcoBview > div.viewTop > p > a > img');
			detailTouristAttractionInfoJSON.phone = $('#cwrap > div.board > div.imgIcoBview > div.viewTop > div.viewDetail > ul > li:nth-child(1)').text();
			detailTouristAttractionInfoJSON.homePage = $('#cwrap > div.board > div.imgIcoBview > div.viewTop > div.viewDetail > ul > li:nth-child(2) > a').attr('href');
			detailTouristAttractionInfoJSON.detailInfo = $('#cwrap > div.board > div.imgIcoBview > div.viewTop > div.viewDetail > ul > li:nth-child(3)').text();
			
			let amenities = [];

			$('#cwrap > div.board > div.imgIcoBview > div.tourInfo > dl:nth-child(1) > dd > ul > li').each((index, element) => {
				amenities[index] = $(element).attr('id') + $(element).attr('style');
			});

			detailTouristAttractionInfoJSON.amenities = amenities;
		
			callbackFunction(null, detailTouristAttractionInfoJSON);
		}
	});*/

	let touristAttractionInfoJSON;

	(async function() {
	  const instance = await phantom.create();
	  const page = await instance.createPage();
	  await page.on('onResourceRequested', function(requestData) {
	  
	  });

	  const status = await page.open('http://disability.seoul.go.kr' + touristAttractionLink);
	  const content = await page.property('content');
	 	
	  await page.evaluate(function() {
	  	return output = {
	  		'imageURL' : document.querySelector('#cwrap div.board div.imgIcoBview div.viewTop p a img').getAttribute('src'),
	  		'phone' : document.querySelector('#cwrap div.board div.imgIcoBview div.viewTop div.viewDetail ul li:nth-child(1)').innerHTML().toString(),
	  		'homepage' : document.querySelector('#cwrap div.board div.imgIcoBview div.viewTop div.viewDetail ul li:nth-child(2) a').getAttribute('href'),
	  		'detailInfo' : document.querySelector('#cwrap div.board div.imgIcoBview div.viewTop div.viewDetail ul li:nth-child(3)').innerHTML().toString(),
	  		'pImg1' : document.getElementById('pImg1').getAttribute('style'),
	  		'pImg2' : document.getElementById('pImg2').getAttribute('style'),
	  		'pImg3' : document.getElementById('pImg3').getAttribute('style'),
	  		'pImg4' : document.getElementById('pImg4').getAttribute('style'),
	  		'pImg5' : document.getElementById('pImg5').getAttribute('style'),
	  		'pImg8' : document.getElementById('pImg8').getAttribute('style'),
	  		'pImg9' : document.getElementById('pImg9').getAttribute('style'),
	  		'pImg10' : document.getElementById('pImg10').getAttribute('style'),
	  		'pImg11' : document.getElementById('pImg11').getAttribute('style'),
	  		'pImg12' : document.getElementById('pImg12').getAttribute('style'),
	  		'pImg13' : document.getElementById('pImg13').getAttribute('style'),
	  		'pImg14' : document.getElementById('pImg14').getAttribute('style'),
	  		'pImg15' : document.getElementById('pImg15').getAttribute('style'),
	  		'pImg16' : document.getElementById('pImg16').getAttribute('style'),
	  		'pImg17' : document.getElementById('pImg17').getAttribute('style')
	  	};
	  }).then(function(output) {
	  	touristAttractionInfoJSON = output;
	  	
	  	callbackFunction(null, touristAttractionInfoJSON);
	  });

	  await instance.exit();
	})();
};