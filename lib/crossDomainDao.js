"use strict";

SPScript = require("./spscript");
SPScript.helpers = require("./helpers");
SPScript.BaseDao = require("./baseDao");
var $ = require("jquery");

(function (sp) {
	var CrossDomainDao = function CrossDomainDao(appWebUrl, hostUrl) {
		this.appUrl = appWebUrl;
		this.hostUrl = hostUrl;
		this.scriptReady = new $.Deferred();

		//Load of up to RequestExecutor javascript from the host site if its not there.
		if (!window.SP || !window.SP.RequestExecutor) {
			this.scriptReady = $.get(hostUrl + "/_layouts/15/SP.RequestExecutor.js", null, null, "script");
		} else {
			setTimeout(function () {
				this.scriptReady.resolve();
			}, 1);
		}
	};

	CrossDomainDao.prototype = new SPScript.BaseDao();

	CrossDomainDao.prototype.executeRequest = function (hostRelativeUrl, options) {
		var self = this,
		    deferred = new $.Deferred(),


		//If a callback was given execute it, passing response then the deferred
		//otherwise just resolve the deferred.
		successCallback = function successCallback(response) {
			var data = $.parseJSON(response.body);
			//a suceess callback was passed in
			if (options.success) {
				options.success(data, deferred);
			} else {
				//no success callback so just make sure its valid OData
				sp.helpers.validateODataV2(data, deferred);
			}
		},
		    errorCallback = function errorCallback(data, errorCode, errorMessage) {
			//an error callback was passed in
			if (options.error) {
				options.error(data, errorCode, errorMessage, deferred);
			} else {
				//no error callback so just reject it
				deferred.reject(errorMessage);
			}
		};

		this.scriptReady.done(function () {
			//tack on the query string question mark if not there already
			if (hostRelativeUrl.indexOf("?") === -1) {
				hostRelativeUrl = hostRelativeUrl + "?";
			}

			var executor = new SP.RequestExecutor(self.appUrl),
			    fullUrl = self.appUrl + "/_api/SP.AppContextSite(@target)" + hostRelativeUrl + "@target='" + self.hostUrl + "'";

			var executeOptions = {
				url: fullUrl,
				type: "GET",
				headers: {
					"Accept": "application/json; odata=verbose"
				},
				success: successCallback,
				error: errorCallback
			};
			//Merge passed in options
			$.extend(true, executeOptions, options);
			executor.executeAsync(executeOptions);
		});
		return deferred.promise();
	};

	sp.CrossDomainDao = CrossDomainDao;
})(SPScript);

module.exports = SPScript.CrossDomainDao;
//# sourceMappingURL=crossDomainDao.js.map