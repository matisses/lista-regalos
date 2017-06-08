(function () {
    var app = angular.module('ListaRegalos', []);
    app.controller('CarritoController', function ($scope, $http) {
        $scope.urlPlaceToPay = '';
        $scope.registrandoCliente = false;
        $scope.clienteExiste = false;
        $scope.procesandoPago = false;
        $scope.datosSesion = null;
        $scope.tiposDocumento = [];
        $scope.tipoDocumento = {
            name: 'Tipo Documento...'
        };
        $scope.codigoLista = '';
        $scope.nombreProducto = '';
        $scope.descripcionProducto = '';
        $scope.mensaje = '';
        $scope.totalCompra = 0;
        $scope.totalImpuestos = 0;
        $scope.ciudadSeleccionada = {
            nombre: 'Ciudad...'
        };
        $scope.ciudades = [];
        $scope.textoBusquedaCiudad = '';
        $scope.ultimoEventoBusquedaCiudad = null;
        $scope.mensajeError = '';
        $scope.mensajeErrorPago = '';
        $scope.datosPagador = {
            tipoDocumento: '',
            documento: '',
            nombres: '',
            apellido1: '',
            apellido2: '',
            correo: '',
            telefono: '',
            direccion: '',
            ciudad: ''
        };

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
            $scope.codigoLista = obtenerValorParametro('codigo');
            if (($scope.codigoLista === null || $scope.codigoLista.trim().length === 0)) {
                //Si no se envia el codigo de la lista en la URL, se redirige al home de listas de regalos
                window.location.href = appParameters.urlSite;
            } else {
                obtenerDatosSesion();
            }
        };

        $scope.eliminarBono = function () {
            $scope.datosSesion.valorBono = 0;
            $http.post(appParameters.urlRest + 'listaregalos/nocomprarbono/', $scope.datosSesion);
        };

        $scope.eliminarProducto = function (producto) {
            if (typeof producto === 'undefined' || producto === null ||
                producto.idProductoLista === null || typeof producto.idProductoLista === 'undefined') {
                return;
            }
            if ($scope.datosSesion.productos.length === 0) {
                return;
            }
            var dto = {
                idSession: $scope.datosSesion.idSession,
                productos: [{
                    idProductoLista: producto.idProductoLista,
                    cantidad: producto.cantidad,
                    precio: producto.precio,
                    referencia: producto.referencia
                }]
            };
            $http.post(appParameters.urlRest + 'listaregalos/nocomprarproducto/', dto).then(
                function (response) {
                    if (response.data) {
                        if (response.data.codigo === 0) {
                            var encontrado = false;
                            var pos = -1;
                            for (var i = 0; i < $scope.datosSesion.productos.length; i++) {
                                if ($scope.datosSesion.productos[i].idProductoLista === producto.idProductoLista) {
                                    pos = i;
                                    break;
                                }
                            }
                            if (pos >= 0) {
                                $scope.datosSesion.productos.splice(pos, 1);
                            }
                            sumarTotalCompra();
                        } else {
                            //TODO: mostrar mensaje error
                            console.error(response.data.mensaje);
                        }
                    } else {
                        //TODO: mostrar mensaje error
                        console.error(response.data.mensaje);
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                    return;
                }
            );
        };

        $scope.volver = function () {
            window.location.href = appParameters.urlSite + 'pages/lista.html?codigo=' + obtenerValorParametro('codigo') + '&sesion=' + obtenerValorParametro('sesion');
        };

        $scope.seleccionarTipoDocumento = function (tipo) {
            $scope.tipoDocumento = tipo;
            $scope.datosPagador.tipoDocumento = tipo.code;
        };

        $scope.seleccionarCiudad = function (ciudad) {
            $scope.ciudadSeleccionada = ciudad;
            $scope.datosPagador.ciudad = ciudad.nombre;
        };

        $scope.continuarPago = function () {
            if ($scope.urlPlaceToPay.length === 0) {
                return;
            }
            window.location.href = $scope.urlPlaceToPay;
        };

        $scope.consultarCliente = function () {
            if ($scope.datosPagador.documento) {
                $http.get(appParameters.urlRest + 'sociodenegocios/' + ($scope.datosPagador.documento.endsWith('CL') ? $scope.datosPagador.documento : $scope.datosPagador.documento + 'CL')).then(
                    function (response) {
                        if (response.data) {
                            $scope.clienteExiste = true;
                            $scope.datosPagador.nombres = response.data.firstName;
                            $scope.datosPagador.apellido1 = response.data.lastName1;
                            $scope.datosPagador.apellido2 = response.data.lastName2;
                            for (var i = 0; i < response.data.addresses.length; i++) {
                                if (response.data.addresses[i].addressName === response.data.defaultBillingAddress) {
                                    $scope.datosPagador.correo = response.data.addresses[i].email;
                                    $scope.datosPagador.direccion = response.data.addresses[i].address;
                                    $scope.datosPagador.ciudad = response.data.addresses[i].cityName;
                                    $scope.datosPagador.telefono = response.data.addresses[i].cellphone;
                                    for (var j = 0; j < $scope.ciudades.length; j++) {
                                        if ($scope.ciudades[j].codigo === response.data.addresses[i].cityCode) {
                                            $scope.ciudadSeleccionada = $scope.ciudades[j];
                                            break;
                                        }
                                    }
                                    for (var j = 0; j < $scope.tiposDocumento.length; j++) {
                                        if ($scope.tiposDocumento[j].code === response.data.fiscalIdTypeStr) {
                                            $scope.tipoDocumento = $scope.tiposDocumento[j];
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                        } else {
                            //TODO: mostrar mensaje error
                            $scope.clienteExiste = false;
                            console.error(response.data.mensaje);
                            limpiarDatosPagador();
                        }
                    },
                    function (response) {
                        //TODO: mostrar mensaje de error
                        console.error(response);
                        limpiarDatosPagador();
                        return;
                    }
                );
            } else {
                limpiarDatosPagador();
            }
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
                    $scope.seleccionarCiudad($scope.ciudades[i]);
                    //$scope.ciudadSeleccionada = $scope.ciudades[i];
                    //$scope.datosPagador.ciudad = ciudad.nombre;
                    $('#listaCiudades').scrollTop(i * 26);
                    break;
                }
            }
        };

        $scope.irAPagar = function () {
            //TODO: validar datos 
            $scope.procesandoPago = true;
            $scope.mensajeErrorPago = '';
            var datosPago = {
                buyer: {
                    documentType: $scope.datosPagador.tipoDocumento,
                    document: $scope.datosPagador.documento,
                    name: $scope.datosPagador.nombres,
                    surname: $scope.datosPagador.apellido1 + ' ' + $scope.datosPagador.apellido2,
                    email: $scope.datosPagador.correo,
                    mobile: $scope.datosPagador.telefono,
                    address: {
                        street: $scope.datosPagador.direccion,
                        city: $scope.datosPagador.ciudad,
                        country: "CO"
                    }
                },
                locale: 'es_CO',
                payment: {
                    reference: null,
                    description: 'Compra lista regalos',
                    amount: {
                        currency: "COP",
                        total: $scope.totalCompra.toString(),
                        taxes: {
                            kind: 'valueAddedTax',
                            amount: parseInt($scope.totalImpuestos.toString()).toString()
                        }
                    },
                    allowPartial: false
                },
                userAgent: navigator.userAgent
            };
            var solicitudDto = {
                codigoLista: obtenerValorParametro('codigo'),
                datosPago: datosPago,
                sesion: $scope.datosSesion,
                mensaje: $scope.mensaje
            };
            $http.post(appParameters.urlRest + 'listaregalos/procesarpago', solicitudDto).then(
                function (response) {
                    if (response.data && response.data.codigo === 0) {
                        console.log(response.data);
                        window.location.href = response.data.respuestaPlaceToPay.processUrl;
                    } else {
                        //TODO: mostrar mensaje error
                        $scope.procesandoPago = false;
                        $scope.mensajeErrorPago = response.data.mensaje;
                        console.error(response.data);
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    $scope.procesandoPago = false;
                    $scope.mensajeErrorPago = 'Ocurrió un error al procesar la solicitud. Intenta de nuevo más tarde o comunícate con nosotros si el problema persiste';
                    console.error(response);
                    return;
                }
            );
        };

        $scope.mostrarModalPago = function () {
            //Validar datos 
            $scope.mensajeError = '';
            if (typeof $scope.datosPagador.tipoDocumento === 'undefined' || $scope.datosPagador.tipoDocumento.length === 0) {
                $scope.mensajeError = 'Debes seleccionar el tipo de documento';
                return;
            }
            if (typeof $scope.datosPagador.documento === 'undefined' || $scope.datosPagador.documento.length === 0) {
                $scope.mensajeError = 'Debes ingresar el numero de documento';
                return;
            }
            if (typeof $scope.datosPagador.nombres === 'undefined' || $scope.datosPagador.nombres.length === 0) {
                $scope.mensajeError = 'Debes ingresar tu nombre';
                return;
            }
            if (typeof $scope.datosPagador.apellido1 === 'undefined' || $scope.datosPagador.apellido1.length === 0) {
                $scope.mensajeError = 'Debes ingresar tu apellido';
                return;
            }
            if (typeof $scope.datosPagador.correo === 'undefined' || $scope.datosPagador.correo.length === 0) {
                $scope.mensajeError = 'Debes ingresar tu correo electrónico';
                return;
            }
            if (typeof $scope.datosPagador.telefono === 'undefined' || $scope.datosPagador.telefono.length === 0) {
                $scope.mensajeError = 'Debes ingresar tu número de teléfono (preferimos si es celular)';
                return;
            }
            if (typeof $scope.datosPagador.direccion === 'undefined' || $scope.datosPagador.direccion.length === 0) {
                $scope.mensajeError = 'Debes ingresar tu dirección';
                return;
            }
            if (typeof $scope.datosPagador.ciudad === 'undefined' || $scope.datosPagador.ciudad.length === 0) {
                $scope.mensajeError = 'Debes seleccionar la ciudad correspondiente a tu dirección';
                return;
            }

            //si el cliente no existe, lo crea
            if (!$scope.clienteExiste) {
                $scope.registrandoCliente = true;
                var cliente = {
                    regimen: 'RC',
                    autorretenedor: 'N',
                    nacionalidad: '01',
                    tipoPersona: '01',
                    codAsesor: '98',
                    sexo: 3, //TODO: mapear con campo
                    tipoDocumento: '13', //TODO: mapear con campo 13=CC, 22=C.E., 41=pasaporte
                    tipoExtranjero: '-',
                    //primerNombre: $scope.datosPagador.nombres,
                    nombres: $scope.datosPagador.nombres,
                    apellido1: $scope.datosPagador.apellido1,
                    apellido2: $scope.datosPagador.apellido2,
                    nit: $scope.datosPagador.documento,
                    email: $scope.datosPagador.correo,
                    celular: $scope.datosPagador.telefono,
                    direccion: $scope.datosPagador.direccion,
                    codDepartamento: $scope.ciudadSeleccionada.codDepartamento,
                    codCiudad: $scope.ciudadSeleccionada.codigo,
                    ciudad: $scope.ciudadSeleccionada.nombre,
                    razonSocial: $scope.datosPagador.apellido1 + ' ' + $scope.datosPagador.apellido2 + ' ' + $scope.datosPagador.nombres,
                    usuario: 'lista-regalos',
                };

                $http.post(appParameters.urlRest + 'sociodenegocios/', cliente).then(
                    function (response) {
                        $scope.registrandoCliente = false;
                        $scope.clienteExiste = true;
                        if (response.data && response.data.codigo === '0') {
                            $('#modalPagar').modal('show');
                        } else {
                            if (response.data && response.data.mensaje && response.data.mensaje.length > 0) {
                                $scope.mensajeError = response.data.mensaje;
                            } else {
                                $scope.mensajeError = 'Ocurrió un error desconocido. Por favor espera un momento y vuelve a intentarlo.';
                            }
                        }
                    },
                    function (response) {
                        $scope.mensajeError = 'Ocurrió un error al registrar tus datos. Por favor espera un momento y vuelve a intentarlo.';
                    }
                );
            } else {
                $('#modalPagar').modal('show');
            }
        }

        listarCiudades = function () {
            $scope.ciudades = [];
            $http.get(appParameters.urlRest + 'baruapplication/listarciudades').then(
                function (response) {
                    if (response.data) {
                        $scope.ciudades = response.data;
                        console.log('se encontraron ' + response.data.length + ' ciudades');
                    } else {
                        console.error('no se encontraron ciudades');
                    }
                },
                function (response) {
                    return;
                }
            );
        };

        limpiarDatosPagador = function () {
            $scope.datosPagador.correo = '';
            $scope.datosPagador.direccion = '';
            $scope.datosPagador.ciudad = '';
            $scope.datosPagador.telefono = '';
            $scope.datosPagador.nombres = '';
            $scope.datosPagador.apellido1 = '';
            $scope.datosPagador.apellido2 = '';
            $scope.ciudadSeleccionada = {
                nombre: 'Ciudad...'
            };
        };

        obtenerDatosSesion = function () {
            //Validar si la sesion ya fue inicializada (===null)
            if ($scope.datosSesion !== null) {
                //1 Si ya fue inicializada, invocar servicio para validar el id
                $http.get(appParameters.urlRest + 'listaregalos/sesion/' + $scope.datosSesion.idSesion).then(
                    function (response) {
                        if (response.data) {
                            if (!response.data.sesionValida) {
                                //1.1 Si el id no es validado con exito, debe redirigir a pagina de seleccion de productos
                                window.location.href = appParameters.urlSite + 'pages/lista.html?codigo=' + obtenerValorParametro('codigo');
                            } else {
                                //1.2 Si el id es validado con exito, finaliza
                                $scope.datosSesion = response.data;
                                consultarTransaccionesPendientes();
                                for (var i in $scope.datosSesion.productos) {
                                    consultarNombreDesc(i);
                                }
                                sumarTotalCompra();
                                consultarTiposDocumento();
                                listarCiudades();
                                console.log($scope.datosSesion);
                            }
                        }
                    },
                    function (response) {
                        //TODO: mostrar mensaje de error
                        console.error(response);
                        return;
                    }
                );
            } else {
                //2 Si la sesion no fue inicializada, valida si hay un codigo de sesion en el request
                var valorParametro = obtenerValorParametro('sesion');
                if (valorParametro) {
                    //2.1 Si ya hay un codigo de sesion en el request, inicializa la sesion e invoca recursivamente el metodo
                    $scope.datosSesion = {
                        idSesion: valorParametro
                    };
                    obtenerDatosSesion();
                } else {
                    //2.2 Si no hay un codigo de sesion en el request, debe redirigir a pagina de seleccion de productos
                    window.location.href = appParameters.urlSite + 'pages/lista.html?codigo=' + obtenerValorParametro('codigo');
                }
            }
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

        consultarNombreDesc = function (i) {
            $http.get(appParameters.urlRest + 'iteminventario/consultanombre/' + $scope.datosSesion.productos[i].referencia).then(
                function (response) {
                    if (response.data) {
                        $scope.datosSesion.productos[i].nombreProducto = response.data.itemName;
                        $scope.datosSesion.productos[i].descripcionProducto = response.data.uDescCorta;
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                    return;
                }
            );
        };

        sumarTotalCompra = function () {
            $scope.totalCompra = 0;
            $scope.totalImpuestos = 0;
            if ($scope.datosSesion.valorBono > 0) {
                $scope.totalCompra = $scope.datosSesion.valorBono;
            } else {
                for (var i in $scope.datosSesion.productos) {
                    var totalLinea = $scope.datosSesion.productos[i].precio * $scope.datosSesion.productos[i].cantidad;
                    $scope.totalCompra += totalLinea;
                    $scope.totalImpuestos += totalLinea - (totalLinea / (1 + ($scope.datosSesion.productos[i].impuesto / 100)));
                }
            }
            console.log('total impuesto: ' + $scope.totalImpuestos.toFixed(2));
        };

        consultarTransaccionesPendientes = function () {
            $http.get(appParameters.urlRest + 'pagos/consultapendiente/' + $scope.datosSesion.idSession).then(
                function (response) {
                    if (response.data) {
                        console.log(response.data);
                        if (response.data.codigo === 1) {
                            //sugerir redireccion a placetopay
                            $scope.urlPlaceToPay = response.data.mensaje;
                            $('#modalPendiente').modal({
                                keyboard: false,
                                backdrop: 'static',
                                show: true
                            });
                        } else if (response.data.codigo === -1) {
                            //redirigir a url recibida
                            window.location.href = response.data.mensaje;
                        }
                    } else {
                        console.error(response);
                    }
                },
                function (response) {
                    console.error(response);
                }
            );
        };
    });
})();
