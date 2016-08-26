var app = angular.module('fundingApp', ['ngSanitize', 'ngCsv']);
app.controller('appController', function($scope, $filter) {
    $scope.Myfiles = [];
    $scope.data = [];
    $scope.total_amount = 0;
    $scope.changeCan = function(){
        $scope.can_round_amount = $scope.total_amount - $scope.app_round_amount;
        $scope.calcApplyifi();
    };
    $scope.changeApp = function(){
         $scope.app_round_amount = $scope.total_amount - $scope.can_round_amount;
         $scope.calcApplyifi();
    };
    $scope.calcApplyifi = function() {
        $scope.can_contri = parseFloat((($scope.can_round_amount / $scope.total_amount) * 100).toFixed(2));
        var can_contri = ($scope.total_amount * $scope.can_contri) / 100;
        $scope.app_round_amount = $scope.total_amount - $scope.can_round_amount;
        $scope.can_round_amount = $scope.total_amount - $scope.app_round_amount;
        $scope.applyifi_contri = parseFloat((100 - $scope.can_contri).toFixed(2));
        var applyifi_contri = $scope.total_amount - can_contri;
        var percentage = (($scope.can_amount / can_contri));
        $scope.applyifi_amount = parseInt((percentage * applyifi_contri));
        $scope.tranch_amount = $scope.applyifi_amount + $scope.can_amount;
        $scope.percentage_of_round = parseFloat((($scope.tranch_amount / $scope.total_amount)*100).toFixed(2));
    };
    $scope.handler = function(e, files) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var string = reader.result;
            $scope.evaluated = $filter('csvToObj')(string);
            $scope.$apply(function() {});
        };
        reader.readAsText(files[0]);
    };

    $scope.calculate = function() {
        $scope.data = [];
        can_array = [];
        applify_array = [];
        for (var i = 0; i < $scope.evaluated.length; i++) {
            if ($scope.evaluated[i].investmentNetwork === "Applyifi Investment Network") {
                applify_array.push($scope.evaluated[i]);
            } else if ($scope.evaluated[i].investmentNetwork === "Calcutta Angels Network") {
                can_array.push($scope.evaluated[i]);
            }
        }
        var amount_decide_in_this_tranch = $scope.tranch_amount;
        var total_amount_in_this_round = $scope.total_amount;
        // $scope.percentage_of_round = parseFloat(((amount_decide_in_this_tranch / total_amount_in_this_round) * 100).toFixed(2));

        for (var j = 0; j < $scope.evaluated.length; j++) {
            var object = {
                investmentNetwork: $scope.evaluated[j].investmentNetwork,
                individualName: $scope.evaluated[j].individualName,
                individualAmount: $scope.evaluated[j].individualAmount,
                individualContri: Math.ceil(($scope.percentage_of_round / 100) * $scope.evaluated[j].individualAmount)
            };
            $scope.data.push(object);
        }
        $scope.exportArray = $scope.data;
    };

    $scope.getHeader = function(){
        return ["Investment Network Name", "Individual Name", "Total Amount", "Individual Contribution"];
    };
});
app.directive('fileChange', ['$parse', function($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, elem, attrs, ngModel) {
            var attrHandler = $parse(attrs['fileChange']);
            var handler = function(e) {
                scope.$apply(function() {
                    attrHandler(scope, {
                        $event: e,
                        files: e.target.files
                    });
                });
            };
            elem[0].addEventListener('change', handler, false);
        }
    };
}]);

app.filter('csvToObj', function() {
    return function(input) {
        var rows = input.split('\n');
        var obj = [];
        rows.shift();
        rows.pop();
        angular.forEach(rows, function(val) {
            var o = val.split(',');
            obj.push({
                investmentNetwork: o[0],
                individualName: o[1],
                individualAmount: o[2],
                individualContri: 0
            });
        });
        return obj;
    };
});