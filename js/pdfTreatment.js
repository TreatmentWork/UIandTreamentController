var http = require('http');
var bodyParser = require("body-parser");
var pdfTAConfig = require(appRoot + '/config/pdfTAConfig.json');
var logger = require(appRoot + '/js/util/winstonConfig.js');

var  doSinglepdfTreatment = function  (host, postData, requestId, callback) {
    dopdfTreatment(host, postData, pdfTAConfig.singleScanEP, requestId, callback);
};

var  doMultiplepdfTreatment = function  (host, postData, requestId, callback) {
    dopdfTreatment(host, postData, pdfTAConfig.multiScanEP, requestId, callback);
};

var  dopdfTreatment = function  (host, postData, endpoint, requestId, callback) {
    var port = pdfTAConfig.port;
    var method = 'POST';

    var headers = {};
    if (method == 'GET') {
      endpoint += '?' + querystring.stringify(data);
    } else {
      headers = {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      };
    }
    var options = {
      host: host,
      port: port,
      path: endpoint,
      method: method,
      headers: headers
    };

    var result = '';
    var timeoutPeriod = parseInt(pdfTAConfig.timeout);
    // request object
    var reqHttp = http.request(options, function (resHttp) {
      // response data
      resHttp.on('data', function (chunk) {
        result += chunk;
      });
      // response end
      resHttp.on('end', function () {
        logger.debug(requestId + 'Treatment Result:' + result);
        callback(null, result);
      });
      //response error
      resHttp.on('error', function (err) {
        logger.error(requestId + 'Error:' + err);
        callback(err);
      });
    });

    reqHttp.setTimeout(timeoutPeriod, function (err) {
      logger.error(requestId + 'Request Set Timeout occured after ' + pdfTAConfig.timeout + ' milliseconds. Error details: ' + err);
      reqHttp.abort();
      callback(err);
    });

    // request error
    reqHttp.on('error', function (err) {
      if (err.code === "ECONNRESET") {
        logger.error(requestId + 'Request Error Timeout occured after ' + pdfTAConfig.timeout + ' milliseconds. Error details: ' + err);
        callback(err);
      } else {
        logger.error(requestId + err);
        callback(err);
      }
    });

    //send request witht the postData form
    logger.debug(requestId + 'postData:' + postData);
    reqHttp.write(postData);
    reqHttp.end();

    // Do not wait for response. Response will be logged  for satus check
    //callback('Request submitted. Use Admin page to check progress of the request.');
    logger.info(requestId + 'Conversion treatment request sent.');

};

module.exports = {
    doSinglepdfTreatment: doSinglepdfTreatment,
    doMultiplepdfTreatment: doMultiplepdfTreatment
};
