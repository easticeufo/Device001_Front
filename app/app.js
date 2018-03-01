/**
 * Created by madongfang on 2016/9/1.
 */

//testServerAddr = "http://localhost:8082/"; // 开发测试时使用
//testServerAddr = "http://www.jy-ae.com/Device901/"; // 开发测试时使用
testServerAddr = ""; // 发布时使用

var device001App = angular.module("device001App", ["ui.router", "restfulApiService", "device001AppCtrls",
    "device001AppFilters", "toolService", "angular-loading-bar", "ui.bootstrap", "infinite-scroll",
    "userLogin", "plug"]);

device001App.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", "cfpLoadingBarProvider",
    function ($stateProvider, $urlRouterProvider, $locationProvider, cfpLoadingBarProvider)
    {
        cfpLoadingBarProvider.parentSelector = "#loading-bar-container";
        cfpLoadingBarProvider.spinnerTemplate = '<img src="imgs/wait.gif">';

        $locationProvider.hashPrefix("?"); // 路由路径中增加?,解决微信支付在IOS手机端页面跳转后导致支付url错误无法支付的问题
        $urlRouterProvider.otherwise("/login");

        $stateProvider
            .state("login", {
                url: "/login",
                template: "<user-login do-login='doLogin(username, password)'></user-login>",
                controller: "LoginController"
            })
            .state("devices", {
                url: "/devices",
                templateUrl: "templates/devices.html",
                controller: "DevicesController"
            })
            .state("devicePlugs", {
                url: "/devices/{deviceCode}/plugs",
                templateUrl: "templates/devicePlugs.html",
                controller: "DevicePlugsController"
            })
            .state("devicePlugCharge", {
                url: "/devices/{deviceCode}/plugs/{plugId}/charge",
                templateUrl: "templates/devicePlugCharge.html",
                controller: "DevicePlugChargeController"
            })
            .state("devicePlugChargeStart", {
                url: "/devices/{deviceCode}/plugs/{plugId}/charge/start/{limitPrice}",
                templateUrl: "templates/devicePlugChargeStart.html",
                controller: "DevicePlugChargeStartController"
            })
            .state("payment", {
                url: "/payment",
                templateUrl: "templates/payment.html",
                controller: "PaymentController"
            })
            .state("paymentRecords", {
                url: "/paymentRecords",
                templateUrl: "templates/paymentRecords.html",
                controller: "PaymentRecordsController"
            })
            .state("chargeRecords", {
                url: "/chargeRecords",
                templateUrl: "templates/chargeRecords.html",
                controller: "ChargeRecordsController"
            })
            .state("mine", {
                url: "/mine",
                templateUrl: "templates/mine.html",
                controller: "MineController"
            })
            .state("billRecords", {
                url: "/billRecords",
                templateUrl: "templates/billRecords.html",
                controller: "BillRecordsController"
            })
            .state("currentCharges", {
                url: "/currentCharges",
                templateUrl: "templates/currentCharges.html",
                controller: "CurrentChargesController"
            })
            .state("map", {
                url: "/map",
                templateUrl: "templates/map.html",
                controller: "MapController"
            })
            .state("chargeStart", {
                url: "/chargeStart",
                templateUrl: "templates/chargeStart.html",
                controller: "ChargeStartController"
            });
    }
]);

device001App.run(["$rootScope", "ApiInfo",
    function ($rootScope, ApiInfo)
    {
        ApiInfo.getManufacturerInfo(
            function (data)
            {
                $rootScope.title = data.webTitle;
                $rootScope.wechatQrcodeAddress = data.wechatQrcodeAddress;
            },
            function (response) {
                alert(response.data.returnMsg);
            }
        );
    }
]);
