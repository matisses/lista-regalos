(function () {
    var app = angular.module('ListaRegalos', []);
    app.controller('ConfirmacionController', function ($scope, $http) {
        $scope.codigoTransaccion = null;
        $scope.datosPlaceToPay = null;
        $scope.descripcionEstado = null;
        $scope.mostrarInformacion = false;

        var estadoInterval = setInterval(function () {
            try {
                if (window.location.search) {
                    $scope.consultarParametrosRequest();
                } else {
                    window.location.href = appParameters.urlSite;
                }
            } catch (error) {
                clearInterval(estadoInterval);
            }

        }, 800);

        $scope.consultarParametrosRequest = function () {
            clearInterval(estadoInterval);
            $scope.codigoTransaccion = obtenerValorParametro('codigo');
            if (($scope.codigoTransaccion === null || $scope.codigoTransaccion.trim().length === 0)) {
                //Si no se envia el codigo de la lista en la URL, se redirige al home de listas de regalos
                window.location.href = appParameters.urlSite;
            } else {
                consultarEstadoTransaccion();
            }
        };

        $scope.irALista = function () {
            window.location.href = appParameters.urlSite + 'pages/lista.html?codigo=' + $scope.datosPlaceToPay.codigoLista;
        };

        consultarEstadoTransaccion = function () {
            $http.get(appParameters.urlRest + 'listaregalos/estadotransaccion/' + $scope.codigoTransaccion).then(
                function (response) {
                    if (response.data) {
                        console.log(response.data);
                        $scope.datosPlaceToPay = response.data;
                        if ($scope.datosPlaceToPay.paymentStatus === 'APPROVED') {
                            $scope.descripcionEstado = 'Transacción Aprobada';
                        } else if ($scope.datosPlaceToPay.paymentStatus === 'PENDING' || $scope.datosPlaceToPay.paymentStatus === null) {
                            $scope.descripcionEstado = 'Transacción Pendiente';
                        } else {
                            $scope.descripcionEstado = 'Transacción Rechazada';
                        }
                        $scope.mostrarInformacion = true;
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                }
            );
        };

        obtenerValorParametro = function (nombre) {
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] === nombre) {
                    return decodeURIComponent(pair[1]);
                }
            }
            return (false);
        };
    });
})();