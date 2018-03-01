/**
 * Created by madongfang on 2016/9/1.
 */

var restfulApiService = angular.module("restfulApiService", ["ngResource"]);

restfulApiService.config(["$resourceProvider",
    function ($resourceProvider)
    {
        $resourceProvider.defaults.actions = {
            get: {method: 'GET', withCredentials: true},
            create: {method: 'POST', withCredentials: true},
            exec: {method: 'POST', withCredentials: true},
            query: {method: 'GET', isArray: true, withCredentials: true},
            update: {method: 'PUT', withCredentials: true},
            delete: {method: 'DELETE', withCredentials: true}
        };
    }
]);

restfulApiService.factory("ApiLogin", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/login");
    }
]);

restfulApiService.factory("ApiDevice", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/devices/:deviceCode", {deviceCode: "@code"},
            {
                getPrompts:{method:"GET", url:testServerAddr + "api/devices/:deviceCode/prompts", isArray: true, withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiDevicePlug", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/devices/:deviceCode/plugs/:plugId", null,
            {
                startCharge:{method:"POST", url:testServerAddr + "api/devices/:deviceCode/plugs/:plugId/chargeStart", withCredentials: true},
                stopCharge:{method:"POST", url:testServerAddr + "api/devices/:deviceCode/plugs/:plugId/chargeStop", withCredentials: true},
                payAndStartCharge:{method:"POST", url:testServerAddr + "api/devices/:deviceCode/plugs/:plugId/payAndStartCharge", withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiPayment", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/payment", null,
            {
                getOptions:{method:"GET", url:testServerAddr + "api/payment/options", isArray: true, withCredentials: true},
                wechatOrder:{method:"POST", url:testServerAddr + "api/payment/wechat/order", withCredentials: true},
                alipayOrder:{method:"POST", url:testServerAddr + "api/payment/alipay/order", withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiMine", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/mine", null,
            {
                getInfo:{method:"GET", url:testServerAddr + "api/mine/info", withCredentials: true},
                getCurrentCharges:{method:"GET", url:testServerAddr + "api/mine/currentCharges",
                    isArray: true, withCredentials: true},
                getRecords:{method:"GET", url:testServerAddr + "api/mine/records/:type",
                    isArray: true, withCredentials: true},
                getLastChargeRecord:{method:"GET", url:testServerAddr + "api/mine/records/:type",
                    params:{type:"charge", last:true}, withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiInfo", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/info", null,
            {
                getManufacturerInfo:{method:"GET", url:testServerAddr + "api/info/manufacturer",
                    withCredentials: true}
            }
        );
    }
]);

restfulApiService.factory("ApiWechat", ["$resource",
    function ($resource) {
        return $resource(testServerAddr + "api/wechat", null,
            {
                getJsSdkConfig:{method:"GET", url:testServerAddr + "api/wechat/jsSdkConfig",
                    withCredentials: true}
            }
        );
    }
]);

var toolService = angular.module("toolService", ["restfulApiService"]);

toolService.factory("Random", function () {
        return {
            getString: function (len) {
                len = len || 32;
                var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                var maxPos = chars.length;
                var randomString = "";
                for (i = 0; i < len; i++) {
                    randomString += chars.charAt(Math.floor(Math.random() * maxPos));
                }
                return randomString;
            }
        };
    }
);

toolService.factory("Payment", ["$q", function ($q) {
        return {
            wechat: function (payRequestParam) {
                return $q(function (resolve, reject)
                {
                    function onBridgeReady()
                    {
                        WeixinJSBridge.invoke("getBrandWCPayRequest", payRequestParam,
                            function (res)
                            {
                                if (res.err_msg == "get_brand_wcpay_request:ok")
                                {
                                    resolve();
                                }
                                else
                                {
                                    reject(res.err_msg);
                                }
                            }
                        );
                    }

                    if (typeof  WeixinJSBridge == "undefined")
                    {
                        if (document.addEventListener)
                        {
                            document.addEventListener("WeixinJSBridgeReady", onBridgeReady, false);
                        }
                        else if (document.attachEvent)
                        {
                            document.attachEvent("WeixinJSBridgeReady", onBridgeReady);
                            document.attachEvent("onWeixinJSBridgeReady", onBridgeReady);
                        }
                        reject("WeixinJSBridge undefined");
                    }
                    else
                    {
                        onBridgeReady();
                    }
                });
            },
            alipay: function (html)
            {
                var newDoc = document.open();
                newDoc.write(html);
                newDoc.close();
            }
        };
    }]
);
