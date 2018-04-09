/**
 * Created by madongfang on 2016/9/1.
 */

device001AppCtrls = angular.module("device001AppCtrls", ["ui.router"]);

device001AppCtrls.controller("LoginController", ["$scope", "$state", "ApiLogin",
    function ($scope, $state, ApiLogin) {
        $scope.doLogin = function (username, password) {
            ApiLogin.exec({username: username, loginCode: password},
                function (data) {
                    $state.go("devices");
                },
                function (response) {
                    alert(response.data.returnMsg);
                }
            );
        };
    }
]);

device001AppCtrls.controller("DevicesController", ["$scope", "ApiDevice",
    function ($scope, ApiDevice)
    {
        $scope.devices = ApiDevice.query(
            function (data) {},
            function (response) {
                alert(response.data.returnMsg);
            }
        );
    }
]);

device001AppCtrls.controller("DevicePlugsController", ["$scope", "$stateParams", "ApiDevice", "ApiDevicePlug", "$uibModal", "$state", "ApiMine",
    function ($scope, $stateParams, ApiDevice, ApiDevicePlug, $uibModal, $state, ApiMine)
    {
        $scope.isTimeDevice = false;

        ApiMine.getCurrentCharges(
            function (data)
            {
                //if (data.length > 0)
                //{
                //    if (confirm("您已经有插座正在充电,是否停止正在充电的插座?"))
                //    {
                //        for (var i = 0; i < data.length; i++)
                //        {
                //            var currentCharge = data[i];
                //            ApiDevicePlug.stopCharge(
                //                {deviceCode:currentCharge.device.code, plugId:currentCharge.plugId},
                //                null,
                //                function (data) {},
                //                function (response)
                //                {
                //                    $scope.errorInfo = response.data.returnMsg;
                //                }
                //            );
                //        }
                //    }
                //}
            },
            function (response) {
                alert(response.data.returnMsg);
            }
        );

        $scope.device = ApiDevice.get({deviceCode:$stateParams.deviceCode},
            function (data)
            {
                if ($scope.device.trialCount != null)
                {
                    if ($scope.device.trialCount >= 0)
                    {
                        alert("该设备为试用版本,剩余试用次数为"+$scope.device.trialCount+"次,激活为正式版本请提前联系厂家(激活一般需要2~3天).");
                    }
                }

                if ($scope.device.type == "time")
                {
                    $scope.isTimeDevice = true;
                }
            },
            function (response)
            {
                alert(response.data.returnMsg);
            }
        );

        $scope.plugs = ApiDevicePlug.query({deviceCode:$stateParams.deviceCode},
            function () {},
            function (response)
            {
                alert(response.data.returnMsg);
            }
        );

        $scope.selectPlug = function (plug)
        {
            if (plug.status == "F")
            {
                $state.go("devicePlugCharge",{deviceCode:$stateParams.deviceCode, plugId:plug.id});
            }
        };

        $scope.prompts = ApiDevice.getPrompts({deviceCode:$stateParams.deviceCode},
            function (data)
            {
                if (data.length != 0)
                {
                    $uibModal.open({
                        templateUrl: "devicePromptModal.html",
                        backdrop:"static",
                        scope:$scope,
                        controller: ["$uibModalInstance", function ($uibModalInstance)
                        {
                            $scope.confirm = function ()
                            {
                                $uibModalInstance.dismiss();
                            };
                        }]
                    });
                }
            },
            function (response) {
                alert(response.data.returnMsg);
            }
        );
    }
]);

device001AppCtrls.controller("DevicePlugChargeController", ["$scope", "$stateParams", "$state",
    "ApiDevice", "ApiMine", "ApiPayment", "Payment", "$uibModal", "ApiDevicePlug",
    function ($scope, $stateParams, $state, ApiDevice, ApiMine, ApiPayment, Payment, $uibModal, ApiDevicePlug)
    {
        $scope.buttonDisabled = false;
        $scope.displayLastRecord = false;
        $scope.plugId = $stateParams.plugId;
        $scope.limitPrice = "2";
        $scope.minPrice = 0.01;
        $scope.maxPrice = 10;
        $scope.isTimeDevice = false;

        $scope.device = ApiDevice.get({deviceCode:$stateParams.deviceCode},
            function ()
            {
                if ($scope.device.type == "time")
                {
                    $scope.isTimeDevice = true;
                    $scope.minPrice = $scope.device.minPrice / 100;
                    $scope.minTime = $scope.device.unitPrice * $scope.minPrice / 60;
                    $scope.limitPrice = $scope.minPrice;
                }
                else
                {
                    $scope.minPrice = ($scope.device.minPrice + $scope.device.attachPrice) / 100;
                }
            },
            function (response)
            {
                alert(response.data.returnMsg);
            }
        );

        $scope.custom = ApiMine.getInfo(
            function (data)
            {
                if ($scope.custom.limitPrice != 200 && $scope.custom.limitPrice != 500 && $scope.device.type != "time")
                {
                    $scope.limitPrice = "0";
                    $scope.customLimitPrice = $scope.custom.limitPrice / 100;
                }
                else
                {
                    $scope.limitPrice = ($scope.custom.limitPrice / 100).toString();
                }
            },
            function (response) {
                alert(response.data.returnMsg);
            }
        );

        $scope.lastChargeRecord = ApiMine.getLastChargeRecord(
            function (data) {
                $scope.duration = ($scope.lastChargeRecord.stopTime - $scope.lastChargeRecord.startTime) / 1000;
                $scope.displayLastRecord = true;
            },
            function (response)
            {
                $scope.displayLastRecord = false;
            }
        );

        $scope.recordDetail = function ()
        {
            $uibModal.open({
                templateUrl: "lastChargeRecordDetailModal.html",
                backdrop:"static",
                scope:$scope,
                controller: ["$uibModalInstance", function ($uibModalInstance)
                {
                    $scope.cancel = function ()
                    {
                        $uibModalInstance.dismiss();
                    };
                }]
            });
        };

        $scope.doCharge = function ()
        {
            $scope.buttonDisabled = true;

            if ($scope.limitPrice != "0")
            {
                $scope.custom.limitPrice = Math.round($scope.limitPrice * 100);
            }
            else
            {
                if ($scope.customLimitPrice)
                {
                    $scope.custom.limitPrice = Math.round($scope.customLimitPrice * 100);
                }
                else
                {
                    alert("自定义充电限额范围:"+$scope.minPrice+"元~"+$scope.maxPrice+"元");
                    $scope.buttonDisabled = false;
                    return;
                }
            }

            if ($scope.device.unitPrice == 0) // 免费充电
            {
                $state.go("devicePlugChargeStart",
                    {
                        deviceCode:$stateParams.deviceCode,
                        plugId:$stateParams.plugId,
                        limitPrice:$scope.custom.limitPrice
                    }
                );
            }
            else if ($scope.custom.balance > 0) // 由用户选择充电支付方式
            {
                $uibModal.open({
                    templateUrl: "chooseChargeModeModal.html",
                    backdrop:"static",
                    scope:$scope,
                    controller: ["$uibModalInstance", function ($uibModalInstance)
                    {
                        $scope.charge={mode: "1"};
                        $scope.confirm = function ()
                        {
                            if ($scope.charge.mode == "1") // 余额支付
                            {
                                $state.go("devicePlugChargeStart",
                                    {
                                        deviceCode:$stateParams.deviceCode,
                                        plugId:$stateParams.plugId,
                                        limitPrice:$scope.custom.limitPrice
                                    }
                                );
                            }
                            else
                            {
                                ApiDevicePlug.payAndStartCharge(
                                    {deviceCode:$stateParams.deviceCode, plugId:$stateParams.plugId},
                                    {limitPrice:$scope.custom.limitPrice, alipayReturnUrl:"/index.html#?/chargeStart"},
                                    function (data) {
                                        if (data.appId) // 微信浏览器
                                        {
                                            Payment.wechat(data).then(
                                                function ()
                                                {
                                                    $state.go("chargeStart");
                                                },
                                                function (reason)
                                                {
                                                    $scope.buttonDisabled = false;
                                                }
                                            );
                                        }
                                        else // 支付宝浏览器
                                        {
                                            Payment.alipay(data.html);
                                        }
                                    },
                                    function (response) {
                                        alert(response.data.returnMsg);
                                        $scope.buttonDisabled = false;
                                    }
                                );
                            }
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function ()
                        {
                            $uibModalInstance.dismiss();
                            $scope.buttonDisabled = false;
                        };
                    }]
                });
            }
            else // 直接支付后充电
            {
                ApiDevicePlug.payAndStartCharge(
                    {deviceCode:$stateParams.deviceCode, plugId:$stateParams.plugId},
                    {limitPrice:$scope.custom.limitPrice, alipayReturnUrl:"/index.html#?/chargeStart"},
                    function (data) {
                        if (data.appId) // 微信浏览器
                        {
                            Payment.wechat(data).then(
                                function ()
                                {
                                    $state.go("chargeStart");
                                },
                                function (reason)
                                {
                                    $scope.buttonDisabled = false;
                                }
                            );
                        }
                        else // 支付宝浏览器
                        {
                            Payment.alipay(data.html);
                        }
                    },
                    function (response) {
                        alert(response.data.returnMsg);
                        $scope.buttonDisabled = false;
                    }
                );
            }
        };
    }
]);

device001AppCtrls.controller("DevicePlugChargeStartController", ["$scope", "$stateParams", "ApiDevicePlug",
    function ($scope, $stateParams, ApiDevicePlug)
    {
        $scope.errorInfo = null;

        $scope.deviceCode = $stateParams.deviceCode;
        $scope.plugId = $stateParams.plugId;
        $scope.limitPrice = $stateParams.limitPrice;

        $scope.startChargeReturn = ApiDevicePlug.startCharge(
            {deviceCode:$stateParams.deviceCode, plugId:$stateParams.plugId},
            {limitPrice:$stateParams.limitPrice},
            function (data) {},
            function (response)
            {
                $scope.errorInfo = response.data.returnMsg;
            }
        );
    }
]);

device001AppCtrls.controller("PaymentController", ["$scope", "$state", "$stateParams",
    "ApiPayment", "ApiMine", "Payment",
    function ($scope, $state, $stateParams, ApiPayment, ApiMine, Payment)
    {
        $scope.buttonDisabled = false;
        $scope.paymentOptions = [{payAmount:1, giftAmount:0}]; // 测试时使用

        $scope.custom = ApiMine.getInfo(
            function (data) {},
            function (response) {
                alert(response.data.returnMsg);
            }
        );

        ApiPayment.getOptions(
            function (data)
            {
                if (data.length != 0)
                {
                    $scope.paymentOptions = data;
                }
            },
            function (response)
            {
                alert(response.data.returnMsg);
            }
        );

        $scope.doPayment = function (amount)
        {
            $scope.buttonDisabled = true;

            if (navigator.userAgent.toLowerCase().indexOf("micromessenger") != -1) // 微信浏览器
            {
                ApiPayment.wechatOrder(null, {amount:amount},
                    function (data) {
                        Payment.wechat(data).then(
                            function ()
                            {
                                location.reload();
                            },
                            function (reason)
                            {
                                $scope.buttonDisabled = false;
                            }
                        );
                    },
                    function (response) {
                        alert(response.data.returnMsg);
                        $scope.buttonDisabled = false;
                    }
                );
            }
            else // 支付宝浏览器
            {
                ApiPayment.alipayOrder(null, {amount:amount, returnUrl:"/index.html#?/payment"},
                    function (data) {
                        Payment.alipay(data.html);
                    },
                    function (response) {
                        alert(response.data.returnMsg);
                        $scope.buttonDisabled = false;
                    }
                );
            }
        };
    }
]);

device001AppCtrls.controller("PaymentRecordsController", ["$scope", "ApiMine",
    function ($scope, ApiMine)
    {
        $scope.paymentRecords = [];
        $scope.loadBusy = false;
        var page = 0;
        $scope.loadRecord = function ()
        {
            if ($scope.loadBusy)
            {
                return;
            }
            $scope.loadBusy = true;
            ApiMine.getRecords({type:"payment", page:page, size:30},
                function (data)
                {
                    if (data.length != 0)
                    {
                        for (var i = 0; i < data.length; i++)
                        {
                            $scope.paymentRecords.push(data[i]);
                        }
                        page++;
                        $scope.loadBusy = false;
                    }
                },
                function (response) {
                    alert(response.data.returnMsg);
                }
            );
        };
    }
]);

device001AppCtrls.controller("ChargeRecordsController", ["$scope", "ApiMine",
    function ($scope, ApiMine)
    {
        $scope.chargeRecords = [];
        $scope.loadBusy = false;
        var page = 0;
        $scope.loadRecord = function ()
        {
            if ($scope.loadBusy)
            {
                return;
            }
            $scope.loadBusy = true;
            ApiMine.getRecords({type:"charge", page:page, size:30},
                function (data)
                {
                    if (data.length != 0)
                    {
                        for (var i = 0; i < data.length; i++)
                        {
                            $scope.chargeRecords.push(data[i]);
                        }
                        page++;
                        $scope.loadBusy = false;
                    }
                },
                function (response)
                {
                    alert(response.data.returnMsg);
                }
            );
        };
    }
]);

device001AppCtrls.controller("MineController", ["$scope", "ApiMine", "$state",
    function ($scope, ApiMine, $state)
    {
        $scope.custom = ApiMine.getInfo(
            function (data) {},
            function (response) {
                alert(response.data.returnMsg);
            }
        );

        $scope.goToPayment = function ()
        {
            if ($scope.custom.freeRecharge)
            {
                var endIdx = location.href.indexOf("Device") + "Device".length + 3;
                var url = location.href.substring(0, endIdx) + "_Manager/api/login?card=" + $scope.custom.nickname;
                location.href = url;
            }
            else
            {
                $state.go("payment");
            }
        };
    }
]);

device001AppCtrls.controller("BillRecordsController", ["$scope", "ApiMine",
    function ($scope, ApiMine)
    {
        $scope.billRecords = [];
        $scope.loadBusy = false;
        var page = 0;
        $scope.loadRecord = function ()
        {
            if ($scope.loadBusy)
            {
                return;
            }
            $scope.loadBusy = true;
            ApiMine.getRecords({type:"bill", page:page, size:30},
                function (data)
                {
                    if (data.length != 0)
                    {
                        for (var i = 0; i < data.length; i++)
                        {
                            $scope.billRecords.push(data[i]);
                        }
                        page++;
                        $scope.loadBusy = false;
                    }
                },
                function (response) {
                    alert(response.data.returnMsg);
                }
            );
        };
    }
]);

device001AppCtrls.controller("CurrentChargesController", ["$scope", "ApiMine", "ApiDevicePlug",
    function ($scope, ApiMine, ApiDevicePlug)
    {
        $scope.currentCharges = ApiMine.getCurrentCharges(
            function (data) {},
            function (response) {
                alert(response.data.returnMsg);
            }
        );

        $scope.stopCharge = function (currentCharge)
        {
            ApiDevicePlug.stopCharge(
                {deviceCode:currentCharge.device.code, plugId:currentCharge.plugId},
                null,
                function (data)
                {
                    alert("停止命令已发送");
                    location.reload();
                },
                function (response)
                {
                    $scope.errorInfo = response.data.returnMsg;
                }
            );
        };
    }
]);

device001AppCtrls.controller("MapController", ["$scope", "ApiDevice", "ApiWechat",
    function ($scope, ApiDevice, ApiWechat)
    {
        ApiWechat.getJsSdkConfig(
            function (data)
            {
                data.jsApiList=["getLocation"];
                data.debug = false;
                wx.config(data);
                wx.ready(function(){
                    wx.getLocation({

                        type: 'wgs84',

                        success: function (res) {

                            var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90

                            var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。

                            var speed = res.speed; // 速度，以米/每秒计

                            var accuracy = res.accuracy; // 位置精度

                            var map = new BMap.Map("map-container");
                            var point = new BMap.Point(longitude, latitude);
                            var convertor = new BMap.Convertor();
                            convertor.translate([point], 1, 5, function (data)
                            {
                                if(data.status === 0) {
                                    map.centerAndZoom(data.points[0], 15);
                                    var myLocationIcon = new BMap.Icon("imgs/myLocation.png", new BMap.Size(24, 24), {anchor: new BMap.Size(10, 24)});
                                    var marker = new BMap.Marker(data.points[0], {icon: myLocationIcon});
                                    map.addOverlay(marker);
                                }
                            });

                            $scope.devices = ApiDevice.query({latitude:latitude, longitude:longitude, distance:10000},
                                function (devices)
                                {
                                    for (var i = 0; i < devices.length; i++)
                                    {
                                        var infoString = devices[i].area+devices[i].location;
                                        var point = new BMap.Point(devices[i].longitude, devices[i].latitude);

                                        (function(infoString){
                                            convertor.translate([point], 1, 5, function (data)
                                            {
                                                if(data.status === 0) {
                                                    var marker = new BMap.Marker(data.points[0]);
                                                    marker.addEventListener("click", function(){
                                                        var infoWindow = new BMap.InfoWindow(infoString);  // 创建信息窗口对象
                                                        marker.openInfoWindow(infoWindow);      // 打开信息窗口
                                                    });
                                                    map.addOverlay(marker);
                                                }
                                            });
                                        })(infoString);

                                    }
                                },
                                function (response) {
                                    alert(response.data.returnMsg);
                                }
                            );
                        }

                    });
                });
            },
            function (response) {
                alert(response.data.returnMsg);
            }
        );

    }
]);

device001AppCtrls.controller("ChargeStartController", ["$scope",
    function ($scope)
    {
    }
]);

device001AppCtrls.controller("SubscribePageController", ["$scope",
    function ($scope)
    {
    }
]);
