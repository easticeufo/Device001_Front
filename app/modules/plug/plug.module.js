/**
 * Created by madongfang on 17/10/27.
 */

var plug = angular.module("plug", []);

plug.directive("plug", function () {
        return {
            restrict: "E",
            replace: true,
            scope:
            {
                plugId: "=",
                isFree: "=",
                busyText: "@"
            },
            templateUrl: "modules/plug/plug.template.html",
            link: function (scope, element, attrs) {
                if (scope.plugId < 10)
                {
                    scope.plugIdStr = "0"+scope.plugId;
                }
                else
                {
                    scope.plugIdStr = scope.plugId;
                }

                if (scope.isFree)
                {
                    scope.state = "空闲";
                }
                else
                {
                    scope.state = "使用中";
                }
            }
        };
    }
);