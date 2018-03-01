device001AppFilters = angular.module("device001AppFilters", []);

device001AppFilters.filter("durationTime", function ()
{
    return function (input)
    {
        var mins = parseInt(input / 60);
        var hour = parseInt(mins / 60);
        var min = mins % 60;
        var str = "";
        if (hour != 0)
        {
            str += hour + "小时";
        }
        str += min + "分钟";
        return str;
    }
});

device001AppFilters.filter("recordType", function ()
{
    return function (input)
    {
        if (input == "D")
        {
            return "开始";
        }
        else if (input == "P")
        {
            return "结束";
        }
        else if (input == "E")
        {
            return "异常";
        }
        else if (input == "Q")
        {
            return "充值";
        }
        else if (input == "S")
        {
            return "赠送";
        }
        else if (input == "T")
        {
            return "退款";
        }
        else
        {
            return input;
        }
    }
});

device001AppFilters.filter("billAmount", function ()
{
    return function (input)
    {
        if (input >= 0)
        {
            return "+" + input;
        }
        else
        {
            return input.toString();
        }
    }
});
