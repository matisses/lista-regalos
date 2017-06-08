(function () {
    //var urlRest = 'http://192.168.5.19:8080/360/webresources/';
    //var urlSite = 'http://192.168.5.19/lista-regalos/';
    var app = angular.module('ListaRegalos', ['ngSanitize']);
    //var app = angular.module('ListaRegalos', []);

    app.controller('BusquedaController', function ($scope, $http) {
        $scope.mostrarInformacion = false;
        $scope.creadores = '';
        $scope.nombreBusqueda = '';
        $scope.apellidoBusqueda = '';
        $scope.codigoLista = '';
        $scope.parametrosBusqueda = '';
        $scope.mensajeErrorBusqueda = '';
        $scope.listasEncontradas = [];
        var estadoInterval = setInterval(function () {
            try {
                if (window.location.search) {
                    $scope.consultarParametrosRequest();
                }
            } catch (error) {
                clearInterval(estadoInterval);
            }

        }, 800);

        $scope.consultarParametrosRequest = function () {
            $scope.parametrosBusqueda = window.location.search;
            var posParam = $scope.parametrosBusqueda.indexOf('=');
            var posSeparador = $scope.parametrosBusqueda.indexOf('&');
            $scope.nombreBusqueda = decodeURIComponent($scope.parametrosBusqueda.substr(posParam + 1, posSeparador - posParam - 1));
            posParam = $scope.parametrosBusqueda.indexOf('=', posSeparador);
            $scope.apellidoBusqueda = decodeURIComponent($scope.parametrosBusqueda.substr(posParam + 1, $scope.parametrosBusqueda.length - posParam));
            clearInterval(estadoInterval);
            //Termina de obtener parametros, valida si debe realizar consulta
            if (($scope.nombreBusqueda === null || $scope.nombreBusqueda.trim().length === 0) &&
                ($scope.apellidoBusqueda === null || $scope.apellidoBusqueda.trim().length === 0)) {
                return;
            }
            $scope.consultarListas();
        };

        $scope.consultarListas = function () {
            $scope.listasEncontradas = [];
            $scope.mensajeErrorBusqueda = '';
            if ((typeof $scope.nombreBusqueda === 'undefined' || $scope.nombreBusqueda.trim().length === 0) &&
                (typeof $scope.apellidoBusqueda === 'undefined' || $scope.apellidoBusqueda.trim().length === 0) &&
                (typeof $scope.codigoLista === 'undefined' || $scope.codigoLista.trim().length === 0)) {
                $scope.mensajeErrorBusqueda = 'Debes ingresar algún criterio de búsqueda.';
                $('#nombreBusqueda').addClass('error');
                $('#apellidoBusqueda').addClass('error');
                $('#codigoBusqueda').addClass('error');
                return;
            }
            $('#nombreBusqueda').removeClass('error');
            $('#apellidoBusqueda').removeClass('error');
            $('#codigoBusqueda').removeClass('error');
            if (typeof $scope.codigoLista === 'undefined' || $scope.codigoLista.trim().length === 0) {
                var consulta = {
                    nombre: $scope.nombreBusqueda,
                    apellido: $scope.apellidoBusqueda
                };
                $http.post(appParameters.urlRest + 'listaregalos/consultarlistas/', consulta).then(
                    function (response) {
                        if (response.data) {
                            $scope.mostrarInformacion = true;
                            if (response.data.length > 0) {
                                $scope.listasEncontradas = response.data;
                            } else {
                                $scope.mensajeErrorBusqueda = 'No existe niguna lista que coincida con los criterios de búsqueda';
                            }
                        }
                    },
                    function (response) {
                        console.error(response);
                        return;
                    }
                );
            } else {
                var consulta = {
                    codigo: $scope.codigoLista
                };
                $http.post(appParameters.urlRest + 'listaregalos/consultarlista/', consulta).then(
                    function (response) {
                        if (response.data && response.data.lista != null) {
                            $scope.mostrarInformacion = true;
                            $scope.listasEncontradas = [response.data.lista];
                        } else {
                            $scope.mensajeErrorBusqueda = 'No existe niguna lista que coincida con los criterios de búsqueda';
                        }
                    },
                    function (response) {
                        console.error(response);
                        return;
                    }
                );
            }
        };

        $scope.seleccionarLista = function (codigoLista) {
            if (typeof codigoLista === 'undefined' || codigoLista === null || codigoLista.trim().length === 0) {
                return;
            }
            window.location.href = appParameters.urlSite + "pages/lista.html?codigo=" + codigoLista;
        };

        $scope.obtenerNombresCreadores = function (lista) {
            if (lista == null || typeof lista.idLista === 'undefined' || lista.idLista === null) {
                return;
            }
            return lista.nombreCreador + ((lista.nombreCocreador !== null && lista.nombreCocreador.length > 0) ? ' y ' + lista.nombreCocreador : '');
        };

        $scope.obtenerDiasFaltantes = function (fecha) {
            var today = new Date();
            var fechaEvento = new Date(fecha);
            var one_day = 1000 * 60 * 60 * 24;
            //Calculate difference btw the two dates, and convert to days
            var dias = Math.ceil((fechaEvento.getTime() - today.getTime()) / (one_day));
            if (dias > 0) {
                return '(Faltan ' + dias + ' días)'
            } else if (dias === 0) {
                return '(<b>Hoy</b>)'
            } else {
                return '(Hace ' + (dias * -1) + ' días)'
            }
        };
    });
})();
