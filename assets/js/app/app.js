(function () {
    //var urlSite = 'http://192.168.5.189/lista-regalos/';
    //var urlRest = 'http://192.168.5.19:8080/360/webresources/';    
    var app = angular.module('ListaRegalos', []);

    app.controller('HomeController', function ($scope, $http) {
        $scope.validandoCliente = false;
        $scope.generandoCodigo = false;
        $scope.tiposDocumento = [];
        $scope.tipoDocumento = {
            name: 'Tipo Documento...'
        };
        $scope.cliente = {
            regimen: 'RC',
            autorretenedor: 'N',
            nacionalidad: '01',
            tipoPersona: '01',
            codAsesor: '98',
            sexo: 3, //TODO: mapear con campo
            tipoDocumento: '13', //TODO: mapear con campo 13=CC, 22=C.E., 41=pasaporte
            tipoExtranjero: '-'
        };
        $scope.acepto = false;
        $scope.nombreBusqueda = '';
        $scope.apellidoBusqueda = '';
        $scope.codigoLista = '';
        $scope.codigoVerificacion = null;
        $scope.ciudadSeleccionada = {
            nombre: 'Ciudad...'
        };
        $scope.mensajeErrorBusqueda = '';
        $scope.mensajeErrorUsuario = '';
        $scope.mensajeErrorValidacion = '';
        $scope.mensajeErrorRegistro = '';
        $scope.ciudades = [];
        $scope.textoBusquedaCiudad = '';
        $scope.ultimoEventoBusquedaCiudad = null;

        $scope.seleccionarTipoDocumento = function (tipo) {
            $scope.tipoDocumento = tipo;
            $scope.cliente.tipoDocumento = tipo.code;
        };

        $scope.seleccionarCiudad = function (ciudad) {
            $scope.ciudadSeleccionada = ciudad;
        };
        
        $scope.buscarCiudad = function (event) {
            if ($scope.ultimoEventoBusquedaCiudad === null) {
                $scope.ultimoEventoBusquedaCiudad = event;
                $scope.textoBusquedaCiudad = event.key.toLowerCase();
            } else {
                if (event.timeStamp - $scope.ultimoEventoBusquedaCiudad.timeStamp < 600) {
                    $scope.textoBusquedaCiudad += event.key.toLowerCase();
                } else {
                    $scope.textoBusquedaCiudad = event.key.toLowerCase();
                }
                $scope.ultimoEventoBusquedaCiudad = event;
            }
            console.log('buscando ciudad ' + $scope.textoBusquedaCiudad);
            for (var i = 0; i < $scope.ciudades.length; i++) {
                if ($scope.ciudades[i].nombre.toLowerCase().startsWith($scope.textoBusquedaCiudad)) {
                    console.log('encontro la ciudad ' + $scope.ciudades[i].nombre);
                    $scope.ciudadSeleccionada = $scope.ciudades[i];
                    $('#listaCiudades').scrollTop(i * 26);
                    break;
                }
            }
        };

        $scope.consultarLista = function () {
            console.log('consultando lista nombre=' + $scope.nombreBusqueda + ' apellido=' + $scope.apellidoBusqueda + ' codigo=' + $scope.codigoLista);
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
            var consulta = {
                codigo: $scope.codigoLista,
                nombre: $scope.nombreBusqueda,
                apellido: $scope.apellidoBusqueda
            };
            if (typeof $scope.codigoLista !== 'undefined' && $scope.codigoLista.trim().length > 0) {
                $http.post(appParameters.urlRest + 'listaregalos/consultarlista/', consulta).then(
                    function (response) {
                        if (response.data) {
                            if (response.data.codigo === 0) {
                                window.location.href = appParameters.urlSite + "pages/lista.html?codigo=" + encodeURIComponent($scope.codigoLista);
                                console.log('encontro lista ' + response.data.lista.idLista);
                            } else {
                                console.error(response.data);
                                $scope.mensajeErrorBusqueda = response.data.mensaje;
                            }
                        }
                    },
                    function (response) {
                        console.error(response);
                        return;
                    }
                );
            } else if ((typeof $scope.nombreBusqueda !== 'undefined' && $scope.nombreBusqueda.trim().length > 0) ||
                (typeof $scope.apellidoBusqueda !== 'undefined' && $scope.apellidoBusqueda.trim().length > 0)) {
                $http.post(appParameters.urlRest + 'listaregalos/consultarlistas/', consulta).then(
                    function (response) {
                        if (response.data) {
                            if (response.data.length > 0) {
                                console.log('encontro ' + response.data.length + ' listas ');
                                window.location.href = appParameters.urlSite + "pages/resultado_busqueda.html?nombre=" +
                                    encodeURIComponent($scope.nombreBusqueda) + '&apellido=' + encodeURIComponent($scope.apellidoBusqueda);
                            } else {
                                $scope.mensajeErrorBusqueda = 'No existe niguna lista que coincida con los criterios de búsqueda';
                                console.error('no se encontraron listas');
                            }
                        }
                    },
                    function (response) {
                        console.error(response);
                        return;
                    }
                );
            }
        };

        $scope.procesarEntrada = function (event) {
            if (event.which === 13) {
                $scope.consultarLista();
                event.preventDefault();
            }
        }

        $scope.procesarLogin = function (event) {
            if (event.which === 13) {
                $scope.validarCliente();
                event.preventDefault();
            }
        }

        $scope.procesarCodigo = function (event) {
            if (event.which === 13) {
                $scope.validarCodigo();
                event.preventDefault();
            }
        }

        $scope.validarCliente = function () {
            console.log('validando cliente cc=' + $scope.cliente.nit + ' email=' + $scope.cliente.email);
            $scope.mensajeErrorUsuario = '';
            if (!$scope.acepto) {
                $scope.mensajeErrorUsuario = 'Debes estar de acuerdo con recibir notificaciones para poder ingresar.';
                $('#chk_entiendo').addClass('error');
                $('#email').removeClass('error');
                $('#cedula').removeClass('error');
                return;
            }
            if (typeof $scope.cliente.email === 'undefined' || $scope.cliente.email.trim().length == 0) {
                $scope.mensajeErrorUsuario = 'Debes ingresar un correo válido.';
                $('#chk_entiendo').removeClass('error');
                $('#email').addClass('error');
                $('#cedula').removeClass('error');
                return;
            }
            if (typeof $scope.cliente.nit === 'undefined' || $scope.cliente.nit.trim().length == 0) {
                $scope.mensajeErrorUsuario = 'Debes ingresar tu cédula.';
                $('#chk_entiendo').removeClass('error');
                $('#email').removeClass('error');
                $('#cedula').addClass('error');
                return;
            }
            $('#chk_entiendo').removeClass('error');
            $('#email').removeClass('error');
            $('#cedula').removeClass('error');
            $scope.validandoCliente = true;
            $http.post(appParameters.urlRest + 'listaregalos/sesion/validarcliente', $scope.cliente).then(
                function (response) {
                    if (response.data) {
                        if (response.data.codigo === 0) {
                            $scope.validandoCliente = false;
                            $scope.cliente = response.data.cliente;
                            console.log('cliente valido. nuevo codigo enviado ');
                            //mostrar modal de confirmacion
                            $("#modalVerificacion").modal({
                                show: true,
                                backdrop: 'static'
                            });
                            //TODO: mostrar ultimos 2 digitos del celular al que se envio el SMS
                        } else if (response.data.codigo === 1) {
                            //El cliente ya recibio un codigo hoy. Solo se enviara otro si el lo solicita
                            $scope.validandoCliente = false;
                            $scope.cliente = response.data.cliente;
                            console.log('cliente valido. no se envia nuevo codigo porque el usuario tiene uno activo ');
                            $("#modalVerificacion").modal({
                                show: true,
                                backdrop: 'static'
                            });
                        } else if (response.data.codigo === -2) {
                            $scope.validandoCliente = false;
                            //TODO: mostrar panel de registro de nuevo cliente
                            listarCiudades();
                            consultarTiposDocumento();
                            $("#modalRegistro").modal('show');
                            console.log('no existe ningun cliente con esos datos. registrar nuevo cliente.');
                        } else {
                            $scope.validandoCliente = false;
                            $scope.mensajeErrorUsuario = response.data.mensaje;
                            console.error(response);
                            return;
                        }
                    }
                },
                function (response) {
                    $scope.validandoCliente = false;
                    $scope.mensajeErrorUsuario = 'Ocurrió un error al comprobar los datos. Por favor intenta de nuevo.';
                    console.error(response);
                    return;
                }
            );
        };
        
        $scope.generarNuevoCodigo = function () {
            $scope.generandoCodigo = true;
            $http.post(appParameters.urlRest + 'listaregalos/sesion/generarcodigo', $scope.cliente).then(
                function (response) {
                    $scope.generandoCodigo = false;
                },
                function (response) {
                    $scope.generandoCodigo = false;
                    $scope.mensajeErrorValidacion = 'Ocurrió un error al generar un nuevo codigo. Por favor intenta de nuevo.';
                    console.error(response);
                    return;
                }
            );
        };

        $scope.validarCodigo = function () {
            console.log('validando codigo ' + $scope.codigoVerificacion);
            if (typeof $scope.codigoVerificacion === 'undefined' || $scope.codigoVerificacion === null || $scope.codigoVerificacion.length !== 6) {
                $scope.mensajeErrorValidacion = 'El código ingresado no es válido. Verifícalo e intenta de nuevo'
                return;
            }
            var datosValidacion = {
                cliente: $scope.cliente,
                codigo: $scope.codigoVerificacion
            };
            $http.post(appParameters.urlRest + 'listaregalos/sesion/validarcodigo', datosValidacion).then(
                function (response) {
                    if (response.data) {
                        if (response.data.sesionValida) {
                            window.location.href = appParameters.urlSite + "pages/admin_lista.html?sesion=" + response.data.idSession;
                        } else {
                            console.error('el codigo ingresado NO es valido');
                            $scope.mensajeErrorValidacion = 'El código ingresado no es válido. Verifícalo e intenta de nuevo'
                            return;
                        }
                    } else {
                        console.error('el codigo ingresado NO es valido');
                        $scope.mensajeErrorValidacion = 'El código ingresado no es válido. Verifícalo e intenta de nuevo'
                        return;
                    }
                },
                function (response) {
                    $scope.mensajeErrorValidacion = 'Ocurrió un error al validar el código. Por favor intenta de nuevo.';
                    console.error(response);
                    return;
                }
            );
        };

        listarCiudades = function () {
            $scope.ciudades = [];
            $http.get(appParameters.urlRest + 'baruapplication/listarciudades').then(
                function (response) {
                    if (response.data) {
                        console.log(response.data);
                        $scope.ciudades = response.data;
                    } else {
                        console.error('no se encontraron ciudades');
                    }
                },
                function (response) {
                    return;
                }
            );
        };

        consultarTiposDocumento = function () {
            $scope.tiposDocumento = [];
            $http.get(appParameters.urlRest + 'tipodocumento/listar').then(
                function (response) {
                    if (response.data) {
                        $scope.tiposDocumento = response.data;
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                    return;
                }
            );
        };

        $scope.crearCliente = function () {
            var allowedChars = /([^A-Za-z0-9\s\-\.])/;
            $('#nombreCliente').removeClass('error');
            $('#apellido1Cliente').removeClass('error');
            $('#cedulaCliente').removeClass('error');
            $('#correo').removeClass('error');
            $('#telefonoCliente').removeClass('error');
            $('#direccionCliente').removeClass('error');
            $('#ciudad').removeClass('error');
            $scope.mensajeErrorRegistro = '';
            //if (typeof $scope.cliente.primerNombre === 'undefined' || $scope.cliente.primerNombre.trim().length === 0) {
            if (typeof $scope.cliente.nombres === 'undefined' || $scope.cliente.nombres.trim().length === 0) {
                $('#nombreCliente').addClass('error');
                $scope.mensajeErrorRegistro = 'Debes ingresar tu nombre';
                return;
            }
            //if (allowedChars.test($scope.cliente.primerNombre)) {
            if (allowedChars.test($scope.cliente.nombres)) {
                $('#nombreCliente').addClass('error');
                $scope.mensajeErrorRegistro = 'El nombre sólo puede incluir letras (A-Z, a-z), numeros (0-9), guiones (-) y puntos (.).';
                return;
            }
            if (typeof $scope.cliente.apellido1 === 'undefined' || $scope.cliente.apellido1.trim().length === 0) {
                $('#apellido1Cliente').addClass('error');
                $scope.mensajeErrorRegistro = 'Debes ingresar tu primer apellido';
                return;
            }
            if (allowedChars.test($scope.cliente.apellido1)) {
                $('#apellido1Cliente').addClass('error');
                $scope.mensajeErrorRegistro = 'El primer apellido sólo puede incluir letras (A-Z, a-z), numeros (0-9), guiones (-) y puntos (.).';
                return;
            }
            if (allowedChars.test($scope.cliente.apellido2)) {
                $('#apellido2Cliente').addClass('error');
                $scope.mensajeErrorRegistro = 'El segundo apellido sólo puede incluir letras (A-Z, a-z), numeros (0-9), guiones (-) y puntos (.).';
                return;
            }
            if ($scope.tipoDocumento.name === 'Tipo Documento...') {
                $scope.mensajeErrorRegistro = 'Debes seleccionar tu tipo de documento';
                return;
            }
            if (typeof $scope.cliente.nit === 'undefined' || $scope.cliente.nit.trim().length === 0) {
                $('#cedulaCliente').addClass('error');
                $scope.mensajeErrorRegistro = 'Debes ingresar tu cédula o número de documento';
                return;
            }
            if (typeof $scope.cliente.email === 'undefined' || $scope.cliente.email.trim().length === 0) {
                $('#correo').addClass('error');
                $scope.mensajeErrorRegistro = 'Debes ingresar tu correo electrónico';
                return;
            }
            if (typeof $scope.cliente.celular === 'undefined' || $scope.cliente.celular.trim().length !== 10) {
                $('#telefonoCliente').addClass('error');
                $scope.mensajeErrorRegistro = 'Debes ingresar tu número de celular (10 caracteres)';
                return;
            }
            if (typeof $scope.cliente.direccion === 'undefined' || $scope.cliente.direccion.trim().length === 0) {
                $('#direccionCliente').addClass('error');
                $scope.mensajeErrorRegistro = 'Debes ingresar tu dirección';
                return;
            }
            if (typeof $scope.ciudadSeleccionada === 'undefined' || typeof $scope.ciudadSeleccionada.codigo === 'undefined') {
                $('#ciudad').addClass('error');
                $scope.mensajeErrorRegistro = 'Debes seleccionar una ciudad';
                return;
            }
            $scope.cliente.codDepartamento = $scope.ciudadSeleccionada.codDepartamento;
            $scope.cliente.codCiudad = $scope.ciudadSeleccionada.codigo;
            $scope.cliente.ciudad = $scope.ciudadSeleccionada.nombre;
            //$scope.cliente.razonSocial = $scope.cliente.apellido1 + ' ' + $scope.cliente.apellido2 + ' ' + $scope.cliente.primerNombre;
            $scope.cliente.razonSocial = $scope.cliente.apellido1 + ' ' + $scope.cliente.apellido2 + ' ' + $scope.cliente.nombres;
            $scope.cliente.usuario = 'lista-regalos';

            $("#modalRegistro").modal('hide');
            $http.post(appParameters.urlRest + 'sociodenegocios/', $scope.cliente).then(
                function (response) {
                    if (response.data && response.data.codigo === '0') {
                        //Valida datos y envia mensaje con codigo de verificacion
                        $scope.validarCliente();
                    } else {
                        if (response.data && response.data.mensaje && response.data.mensaje.length > 0) {
                            $scope.mensajeErrorRegistro = response.data.mensaje;
                        } else {
                            $scope.mensajeErrorRegistro = 'Ocurrió un error desconocido. Por favor espera un momento y vuelve a intentarlo.';
                        }
                        $("#modalRegistro").modal('show');
                    }
                },
                function (response) {
                    $scope.mensajeErrorRegistro = 'Ocurrió un error al registrar tus datos. Por favor espera un momento y vuelve a intentarlo.';
                    $("#modalRegistro").modal('show');
                }
            );
        };
    });
})();