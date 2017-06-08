(function () {
    angular.module('ListaRegalos').controller('ContactController', function ($scope, $http) {
        $scope.nombre = '';
        $scope.email = '';
        $scope.asunto = '';
        $scope.mensaje = '';

        $scope.enviarMensaje = function () {
            if (typeof $scope.nombre === 'undefined' || $scope.nombre === null || $scope.nombre.trim().length === 0) {
                console.error('el nombre es necesario');
                return;
            }
            if (typeof $scope.email === 'undefined' || $scope.email === null || $scope.email.trim().length === 0) {
                console.error('el email es necesario');
                return;
            }
            if (typeof $scope.asunto === 'undefined' || $scope.asunto === null || $scope.asunto.trim().length === 0) {
                console.error('el asunto es necesario');
                return;
            }
            if (typeof $scope.mensaje === 'undefined' || $scope.mensaje === null || $scope.mensaje.trim().length === 0) {
                console.error('el mensaje es necesario');
                return;
            }
            var contacto = {
                nombre: $scope.nombre,
                email: $scope.email,
                asunto: $scope.asunto,
                mensaje: $scope.mensaje
            };
            $http.post(appParameters.urlRest + 'contacto/enviar', contacto).then(
                function (response) {
                    console.log('mensaje enviado con exito');
                },
                function (response) {
                    console.error(response);
                }
            );
            $('#myModalContacto').modal('hide');
        };
    });
})();
