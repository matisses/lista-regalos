(function () {
    var app = angular.module('ListaRegalos', []);
    app.controller('EditInfoController', function ($scope, $http) {
        $scope.tiposDocumento = [];
        $scope.datosSesion = null;
        $scope.notiInmediataSMSCreador = false;
        $scope.notiInmediataEmailCreador = false;
        $scope.notiDiariaSMSCreador = false;
        $scope.notiDiariaEmailCreador = false;
        $scope.notiSemanalSMSCreador = false;
        $scope.notiSemanalEmailCreador = false;
        $scope.notiCategoriaSMSCreador = false;
        $scope.notiCategoriaEmailCreador = false;
        $scope.notiInmediataSMSCocreador = false;
        $scope.notiInmediataEmailCocreador = false;
        $scope.notiDiariaSMSCocreador = false;
        $scope.notiDiariaEmailCocreador = false;
        $scope.notiSemanalSMSCocreador = false;
        $scope.notiSemanalEmailCocreador = false;
        $scope.notiCategoriaSMSCocreador = false;
        $scope.notiCategoriaEmailCocreador = false;

        $scope.lista = {
            mensajeBienvenida: ''
        };
        $scope.tipoDocumentoCreador = {
            name: '* Tipo de Documento'
        };
        $scope.tipoDocumentoCocreador = {
            name: '* Tipo de Documento'
        };
        $scope.ciudadCreadorSeleccionada = {
            nombre: 'Ciudad...'
        };
        $scope.ciudadCocreadorSeleccionada = {
            nombre: 'Ciudad...'
        };
        $scope.tipoEventoSeleccionado = '* Tipo de Evento';
        $scope.mostrarInformacion = false;
        $scope.textoBusquedaCiudad = '';
        $scope.ultimoEventoBusquedaCiudad = null;

        var estadoInterval = setInterval(function () {
            try {
                if (window.location.search) {
                    clearInterval(estadoInterval);
                    obtenerDatosSesion();
                } else {
                    //window.location.href = urlSite;
                }
            } catch (error) {
                clearInterval(estadoInterval);
            }

        }, 800);

        $scope.buscarCiudad = function (event, idComponent) {
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
            for (var i = 0; i < $scope.ciudades.length; i++) {
                if ($scope.ciudades[i].nombre.toLowerCase().startsWith($scope.textoBusquedaCiudad)) {
                    if (idComponent === 'listaCiudades') {
                        $scope.ciudadCreadorSeleccionada = $scope.ciudades[i];
                    } else {
                        $scope.ciudadCocreadorSeleccionada = $scope.ciudades[i];
                    }
                    $('#' + idComponent).scrollTop(i * 26);
                    break;
                }
            }
        };

        $scope.seleccionarTipoEvento = function (tipo, descTipo) {
            $scope.lista.tipoEvento.idTipoEvento = tipo;
            $scope.tipoEventoSeleccionado = descTipo;
        };

        $scope.cambiarListaPublicaPrivada = function () {
            $scope.lista.listaPrivada = !$scope.lista.listaPrivada;
        };

        $scope.cambiarNotificacionCreador = function (frecuencia, tipo) {
            if (frecuencia === 'I') {
                if (tipo === 'E') {
                    if ($scope.lista.notificacionInmediataCreador === 'E') {
                        $scope.lista.notificacionInmediataCreador = 'N';
                    } else if ($scope.lista.notificacionInmediataCreador === 'N') {
                        $scope.lista.notificacionInmediataCreador = 'E';
                    } else if ($scope.lista.notificacionInmediataCreador === 'T') {
                        $scope.lista.notificacionInmediataCreador = 'S';
                    } else if ($scope.lista.notificacionInmediataCreador === 'S') {
                        $scope.lista.notificacionInmediataCreador = 'T';
                    }
                } else {
                    if ($scope.lista.notificacionInmediataCreador === 'E') {
                        $scope.lista.notificacionInmediataCreador = 'T';
                    } else if ($scope.lista.notificacionInmediataCreador === 'N') {
                        $scope.lista.notificacionInmediataCreador = 'S';
                    } else if ($scope.lista.notificacionInmediataCreador === 'T') {
                        $scope.lista.notificacionInmediataCreador = 'E';
                    } else if ($scope.lista.notificacionInmediataCreador === 'S') {
                        $scope.lista.notificacionInmediataCreador = 'N';
                    }
                }
            } else if (frecuencia === 'D') {
                if (tipo === 'E') {
                    if ($scope.lista.notificacionDiariaCreador === 'E') {
                        $scope.lista.notificacionDiariaCreador = 'N';
                    } else if ($scope.lista.notificacionDiariaCreador === 'N') {
                        $scope.lista.notificacionDiariaCreador = 'E';
                    } else if ($scope.lista.notificacionDiariaCreador === 'T') {
                        $scope.lista.notificacionDiariaCreador = 'S';
                    } else if ($scope.lista.notificacionDiariaCreador === 'S') {
                        $scope.lista.notificacionDiariaCreador = 'T';
                    }
                } else {
                    if ($scope.lista.notificacionDiariaCreador === 'E') {
                        $scope.lista.notificacionDiariaCreador = 'T';
                    } else if ($scope.lista.notificacionDiariaCreador === 'N') {
                        $scope.lista.notificacionDiariaCreador = 'S';
                    } else if ($scope.lista.notificacionDiariaCreador === 'T') {
                        $scope.lista.notificacionDiariaCreador = 'E';
                    } else if ($scope.lista.notificacionDiariaCreador === 'S') {
                        $scope.lista.notificacionDiariaCreador = 'N';
                    }
                }
            } else if (frecuencia === 'S') {
                if (tipo === 'E') {
                    if ($scope.lista.notificacionSemanalCreador === 'E') {
                        $scope.lista.notificacionSemanalCreador = 'N';
                    } else if ($scope.lista.notificacionSemanalCreador === 'N') {
                        $scope.lista.notificacionSemanalCreador = 'E';
                    } else if ($scope.lista.notificacionSemanalCreador === 'T') {
                        $scope.lista.notificacionSemanalCreador = 'S';
                    } else if ($scope.lista.notificacionSemanalCreador === 'S') {
                        $scope.lista.notificacionSemanalCreador = 'T';
                    }
                } else {
                    if ($scope.lista.notificacionSemanalCreador === 'E') {
                        $scope.lista.notificacionSemanalCreador = 'T';
                    } else if ($scope.lista.notificacionSemanalCreador === 'N') {
                        $scope.lista.notificacionSemanalCreador = 'S';
                    } else if ($scope.lista.notificacionSemanalCreador === 'T') {
                        $scope.lista.notificacionSemanalCreador = 'E';
                    } else if ($scope.lista.notificacionSemanalCreador === 'S') {
                        $scope.lista.notificacionSemanalCreador = 'N';
                    }
                }
            } else if (frecuencia === 'C') {
                if (tipo === 'E') {
                    if ($scope.lista.notificacionCambioCategoriaCreador === 'E') {
                        $scope.lista.notificacionCambioCategoriaCreador = 'N';
                    } else if ($scope.lista.notificacionCambioCategoriaCreador === 'N') {
                        $scope.lista.notificacionCambioCategoriaCreador = 'E';
                    } else if ($scope.lista.notificacionCambioCategoriaCreador === 'T') {
                        $scope.lista.notificacionCambioCategoriaCreador = 'S';
                    } else if ($scope.lista.notificacionCambioCategoriaCreador === 'S') {
                        $scope.lista.notificacionCambioCategoriaCreador = 'T';
                    }
                } else {
                    if ($scope.lista.notificacionCambioCategoriaCreador === 'E') {
                        $scope.lista.notificacionCambioCategoriaCreador = 'T';
                    } else if ($scope.lista.notificacionCambioCategoriaCreador === 'N') {
                        $scope.lista.notificacionCambioCategoriaCreador = 'S';
                    } else if ($scope.lista.notificacionCambioCategoriaCreador === 'T') {
                        $scope.lista.notificacionCambioCategoriaCreador = 'E';
                    } else if ($scope.lista.notificacionCambioCategoriaCreador === 'S') {
                        $scope.lista.notificacionCambioCategoriaCreador = 'N';
                    }
                }
            }
            validarEstadoNotificaciones();
        };

        $scope.cambiarNotificacionCocreador = function (frecuencia, tipo) {
            if (frecuencia === 'I') {
                if (tipo === 'E') {
                    if ($scope.lista.notificacionInmediataCocreador === 'E') {
                        $scope.lista.notificacionInmediataCocreador = 'N';
                    } else if ($scope.lista.notificacionInmediataCocreador === 'N' ||
                        $scope.lista.notificacionInmediataCocreador === null) {
                        $scope.lista.notificacionInmediataCocreador = 'E';
                    } else if ($scope.lista.notificacionInmediataCocreador === 'T') {
                        $scope.lista.notificacionInmediataCocreador = 'S';
                    } else if ($scope.lista.notificacionInmediataCocreador === 'S') {
                        $scope.lista.notificacionInmediataCocreador = 'T';
                    }
                } else {
                    if ($scope.lista.notificacionInmediataCocreador === 'E') {
                        $scope.lista.notificacionInmediataCocreador = 'T';
                    } else if ($scope.lista.notificacionInmediataCocreador === 'N' ||
                        $scope.lista.notificacionInmediataCocreador === null) {
                        $scope.lista.notificacionInmediataCocreador = 'S';
                    } else if ($scope.lista.notificacionInmediataCocreador === 'T') {
                        $scope.lista.notificacionInmediataCocreador = 'E';
                    } else if ($scope.lista.notificacionInmediataCocreador === 'S') {
                        $scope.lista.notificacionInmediataCocreador = 'N';
                    }
                }
            } else if (frecuencia === 'D') {
                if (tipo === 'E') {
                    if ($scope.lista.notificacionDiariaCocreador === 'E') {
                        $scope.lista.notificacionDiariaCocreador = 'N';
                    } else if ($scope.lista.notificacionDiariaCocreador === 'N' ||
                        $scope.lista.notificacionDiariaCocreador === null) {
                        $scope.lista.notificacionDiariaCocreador = 'E';
                    } else if ($scope.lista.notificacionDiariaCocreador === 'T') {
                        $scope.lista.notificacionDiariaCocreador = 'S';
                    } else if ($scope.lista.notificacionDiariaCocreador === 'S') {
                        $scope.lista.notificacionDiariaCocreador = 'T';
                    }
                } else {
                    if ($scope.lista.notificacionDiariaCocreador === 'E') {
                        $scope.lista.notificacionDiariaCocreador = 'T';
                    } else if ($scope.lista.notificacionDiariaCocreador === 'N' ||
                        $scope.lista.notificacionDiariaCocreador === null) {
                        $scope.lista.notificacionDiariaCocreador = 'S';
                    } else if ($scope.lista.notificacionDiariaCocreador === 'T') {
                        $scope.lista.notificacionDiariaCocreador = 'E';
                    } else if ($scope.lista.notificacionDiariaCocreador === 'S') {
                        $scope.lista.notificacionDiariaCocreador = 'N';
                    }
                }
            } else if (frecuencia === 'S') {
                if (tipo === 'E') {
                    if ($scope.lista.notificacionSemanalCocreador === 'E') {
                        $scope.lista.notificacionSemanalCocreador = 'N';
                    } else if ($scope.lista.notificacionSemanalCocreador === 'N' ||
                        $scope.lista.notificacionSemanalCocreador === null) {
                        $scope.lista.notificacionSemanalCocreador = 'E';
                    } else if ($scope.lista.notificacionSemanalCocreador === 'T') {
                        $scope.lista.notificacionSemanalCocreador = 'S';
                    } else if ($scope.lista.notificacionSemanalCocreador === 'S') {
                        $scope.lista.notificacionSemanalCocreador = 'T';
                    }
                } else {
                    if ($scope.lista.notificacionSemanalCocreador === 'E') {
                        $scope.lista.notificacionSemanalCocreador = 'T';
                    } else if ($scope.lista.notificacionSemanalCocreador === 'N' ||
                        $scope.lista.notificacionSemanalCocreador === null) {
                        $scope.lista.notificacionSemanalCocreador = 'S';
                    } else if ($scope.lista.notificacionSemanalCocreador === 'T') {
                        $scope.lista.notificacionSemanalCocreador = 'E';
                    } else if ($scope.lista.notificacionSemanalCocreador === 'S') {
                        $scope.lista.notificacionSemanalCocreador = 'N';
                    }
                }
            } else if (frecuencia === 'C') {
                if (tipo === 'E') {
                    if ($scope.lista.notificacionCambioCategoriaCocreador === 'E') {
                        $scope.lista.notificacionCambioCategoriaCocreador = 'N';
                    } else if ($scope.lista.notificacionCambioCategoriaCocreador === 'N' ||
                        $scope.lista.notificacionCambioCategoriaCocreador === null) {
                        $scope.lista.notificacionCambioCategoriaCocreador = 'E';
                    } else if ($scope.lista.notificacionCambioCategoriaCocreador === 'T') {
                        $scope.lista.notificacionCambioCategoriaCocreador = 'S';
                    } else if ($scope.lista.notificacionCambioCategoriaCocreador === 'S') {
                        $scope.lista.notificacionCambioCategoriaCocreador = 'T';
                    }
                } else {
                    if ($scope.lista.notificacionCambioCategoriaCocreador === 'E') {
                        $scope.lista.notificacionCambioCategoriaCocreador = 'T';
                    } else if ($scope.lista.notificacionCambioCategoriaCocreador === 'N' ||
                        $scope.lista.notificacionCambioCategoriaCocreador === null) {
                        $scope.lista.notificacionCambioCategoriaCocreador = 'S';
                    } else if ($scope.lista.notificacionCambioCategoriaCocreador === 'T') {
                        $scope.lista.notificacionCambioCategoriaCocreador = 'E';
                    } else if ($scope.lista.notificacionCambioCategoriaCocreador === 'S') {
                        $scope.lista.notificacionCambioCategoriaCocreador = 'N';
                    }
                }
            }
            validarEstadoNotificaciones();
        };

        validarEstadoNotificaciones = function () {
            $scope.notiInmediataSMSCreador = $scope.lista.notificacionInmediataCreador === 'T' || $scope.lista.notificacionInmediataCreador === 'S';
            $scope.notiInmediataEmailCreador = $scope.lista.notificacionInmediataCreador === 'T' || $scope.lista.notificacionInmediataCreador === 'E';
            $scope.notiDiariaSMSCreador = $scope.lista.notificacionDiariaCreador === 'T' || $scope.lista.notificacionDiariaCreador === 'S';
            $scope.notiDiariaEmailCreador = $scope.lista.notificacionDiariaCreador === 'T' || $scope.lista.notificacionDiariaCreador === 'E';
            $scope.notiSemanalSMSCreador = $scope.lista.notificacionSemanalCreador === 'T' || $scope.lista.notificacionSemanalCreador === 'S';
            $scope.notiSemanalEmailCreador = $scope.lista.notificacionSemanalCreador === 'T' || $scope.lista.notificacionSemanalCreador === 'E';
            $scope.notiCategoriaSMSCreador = $scope.lista.notificacionCambioCategoriaCreador === 'T' || $scope.lista.notificacionCambioCategoriaCreador === 'S';
            $scope.notiCategoriaEmailCreador = $scope.lista.notificacionCambioCategoriaCreador === 'T' || $scope.lista.notificacionCambioCategoriaCreador === 'E';

            $scope.notiInmediataSMSCocreador = $scope.lista.notificacionInmediataCocreador === 'T' || $scope.lista.notificacionInmediataCocreador === 'S';
            $scope.notiInmediataEmailCocreador = $scope.lista.notificacionInmediataCocreador === 'T' || $scope.lista.notificacionInmediataCocreador === 'E';
            $scope.notiDiariaSMSCocreador = $scope.lista.notificacionDiariaCocreador === 'T' || $scope.lista.notificacionDiariaCocreador === 'S';
            $scope.notiDiariaEmailCocreador = $scope.lista.notificacionDiariaCocreador === 'T' || $scope.lista.notificacionDiariaCocreador === 'E';
            $scope.notiSemanalSMSCocreador = $scope.lista.notificacionSemanalCocreador === 'T' || $scope.lista.notificacionSemanalCocreador === 'S';
            $scope.notiSemanalEmailCocreador = $scope.lista.notificacionSemanalCocreador === 'T' || $scope.lista.notificacionSemanalCocreador === 'E';
            $scope.notiCategoriaSMSCocreador = $scope.lista.notificacionCambioCategoriaCocreador === 'T' || $scope.lista.notificacionCambioCategoriaCocreador === 'S';
            $scope.notiCategoriaEmailCocreador = $scope.lista.notificacionCambioCategoriaCocreador === 'T' || $scope.lista.notificacionCambioCategoriaCocreador === 'E';
        };

        $scope.alternarAceptaBonos = function () {
            $scope.lista.aceptaBonos = !$scope.lista.aceptaBonos;
        };

        $scope.alternarEntregaPersonal = function () {
            $scope.lista.permitirEntregaPersonal = !$scope.lista.permitirEntregaPersonal;
        };

        $scope.guardar = function () {
            //Validar datos del creador
            if ($scope.lista.nombreCreador === null || $scope.lista.nombreCreador.length === 0) {
                console.error('el nombre del creador es obligatorio');
                return;
            }
            if ($scope.lista.apellidoCreador === null || $scope.lista.apellidoCreador.length === 0) {
                console.error('el primer apellido del creador es obligatorio');
                return;
            }
            if ($scope.tipoDocumentoCreador === null || $scope.tipoDocumentoCreador.name.length === 0) {
                console.error('el tipo de documento del creador es obligatorio');
                return;
            }
            if ($scope.lista.cedulaCreador === null || $scope.lista.cedulaCreador.length === 0) {
                console.error('el numero de documento del creador es obligatorio');
                return;
            }
            if ($scope.lista.celularCreador === null || $scope.lista.celularCreador.length === 0) {
                console.error('el numero de celular del creador es obligatorio');
                return;
            }
            if ($scope.lista.correoCreador === null || $scope.lista.correoCreador.length === 0) {
                console.error('el correo electronico del creador es obligatorio');
                return;
            }
            if ($scope.ciudadCreadorSeleccionada === null || $scope.ciudadCreadorSeleccionada.nombre.length === 0) {
                console.error('el numero de documento del creador es obligatorio');
                return;
            }
            //TODO: validar datos del cocreador, si se ingresa alguno
            //Validar datos de la lista
            if ($scope.lista.nombre == null || $scope.lista.nombre.trim().length === 0) {
                console.error('el nombre de la lista es obligatorio');
                return;
            }
            if ($scope.lista.tipoEvento == null || $scope.lista.tipoEvento.idTipoEvento === 0) {
                console.error('el tipo de evento es obligatorio');
                return;
            }
            if ($scope.lista.fechaEvento == null) {
                console.error('la fecha del evento es obligatoria');
                return;
            }
            if ($scope.lista.fechaEvento < new Date()) {
                console.error('la fecha del evento no puede ser una fecha en el pasado');
                return;
            }
            if ($scope.lista.aceptaBonos && (typeof $scope.lista.valorMinimoBono === 'undefined' || $scope.lista.valorMinimoBono <= 0)) {
                console.error('debes indicar el valor minimo para los bonos si indicas que deseas recibirlos');
                return;
            }
            if (typeof $scope.lista.invitados === 'undefined' || $scope.lista.invitados <= 0) {
                console.error('debes indicar el numero de invitados del evento');
                return;
            }
            $http.post(appParameters.urlRest + 'listaregalos/modificar', $scope.lista).then(
                function (response) {
                    if (response.data) {
                        if (response.data.codigo === 0) {
                            window.location.href = appParameters.urlSite + 'pages/editar_lista.html?sesion=' + $scope.datosSesion.idSession + '&codigo=' + response.data.mensaje;
                        }
                        console.log(response);
                    } else {
                        console.error(response);
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                    return;
                }
            );
        };

        obtenerDatosSesion = function () {
            //Validar si la sesion ya fue inicializada (===null)
            if ($scope.datosSesion !== null) {
                //1 Si ya fue inicializada, invocar servicio para validar el id
                $http.get(appParameters.urlRest + 'listaregalos/sesion/' + $scope.datosSesion.idSession).then(
                    function (response) {
                        if (response.data) {
                            if (!response.data.sesionValida) {
                                //1.1 Si el id no es validado con exito, debe redirigir a pagina de inicio
                                window.location.href = appParameters.urlSite;
                            } else {
                                //1.2 Si el id es validado con exito, finaliza
                                console.log(response.data);
                                $scope.datosSesion = response.data;
                                consultarTiposDocumento();
                                listarCiudades();
                                consultarLista();
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
                        idSession: valorParametro
                    };
                    obtenerDatosSesion();
                } else {
                    //2.2 Si no hay un codigo de sesion en el request, debe redirigir a pagina de inicio
                    //window.location.href = urlSite;
                }
            }
        };

        consultarLista = function () {
            var consulta = {
                codigo: obtenerValorParametro('codigo')
            };
            $http.post(appParameters.urlRest + 'listaregalos/consultarlista/', consulta).then(
                function (response) {
                    if (response.data) {
                        if (response.data.codigo === 0) {
                            $scope.lista = response.data.lista;
                            $scope.lista.fechaEvento = new Date($scope.lista.fechaEventoUTC);
                            validarEstadoNotificaciones();
                            console.log($scope.lista);
                            consultarInformacionCreador();
                            consultarInformacionCocreador();
                            $scope.tipoEventoSeleccionado = $scope.lista.tipoEvento.nombre;
                            validarEstadoNotificaciones();
                            $scope.mostrarInformacion = true;
                        } else {
                            window.location.href = appParameters.urlSite;
                        }

                        clearInterval(estadoInterval);
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    clearInterval(estadoInterval);
                    console.error(response);
                }
            );
        };

        consultarInformacionCreador = function () {
            var cedula = $scope.lista.cedulaCreador.toUpperCase();
            if (!cedula.endsWith('CL')) {
                cedula += 'CL';
            }
            $http.get(appParameters.urlRest + 'sociodenegocios/' + cedula).then(
                function (response) {
                    if (response.data) {
                        //Selecciona el municipio
                        if (response.data.addresses.length > 0) {
                            for (var j = 0; j < $scope.ciudades.length; j++) {
                                if ($scope.ciudades[j].codigo === response.data.addresses[0].cityCode) {
                                    $scope.ciudadCreadorSeleccionada = $scope.ciudades[j];
                                    $scope.lista.celularCreador = response.data.addresses[0].cellphone;
                                    $scope.lista.correoCreador = response.data.addresses[0].email;
                                    break;
                                }
                            }
                        }
                        //Selecciona el tipo de documento
                        for (var j = 0; j < $scope.tiposDocumento.length; j++) {
                            if ($scope.tiposDocumento[j].code === response.data.fiscalIdTypeStr) {
                                $scope.tipoDocumentoCreador = $scope.tiposDocumento[j];
                                break;
                            }
                        }
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                    return;
                }
            );
        };

        consultarInformacionCocreador = function () {
            if (typeof $scope.lista.cedulaCocreador === 'undefined' || $scope.lista.cedulaCocreador === null) {
                return;
            }
            var cedula = $scope.lista.cedulaCocreador.toUpperCase();
            if (!cedula.endsWith('CL')) {
                cedula += 'CL';
            }
            $http.get(appParameters.urlRest + 'sociodenegocios/' + cedula).then(
                function (response) {
                    if (response.data) {
                        //Selecciona el municipio
                        if (response.data.addresses.length > 0) {
                            for (var j = 0; j < $scope.ciudades.length; j++) {
                                if ($scope.ciudades[j].codigo === response.data.addresses[0].cityCode) {
                                    $scope.ciudadCocreadorSeleccionada = $scope.ciudades[j];
                                    $scope.lista.celularCocreador = response.data.addresses[0].cellphone;
                                    $scope.lista.correoCocreador = response.data.addresses[0].email;
                                    break;
                                }
                            }
                        }
                        //Selecciona el tipo de documento
                        for (var j = 0; j < $scope.tiposDocumento.length; j++) {
                            if ($scope.tiposDocumento[j].code === response.data.fiscalIdTypeStr) {
                                $scope.tipoDocumentoCocreador = $scope.tiposDocumento[j];
                                break;
                            }
                        }
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                    return;
                }
            );
        };

        consultarPaginas = function () {
            $http.get(appParameters.urlRest + 'listaregalos/consultartotalproductos/' + $scope.lista.idLista).then(
                function (response) {
                    if (response.data) {
                        $scope.totalProductos = response.data;
                        calcularPaginas();
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                    return;
                }
            );
        };

        calcularPaginas = function () {
            var paginasMostradas = 5;
            $scope.paginas = [];
            var totalPaginas = Math.ceil($scope.totalProductos / $scope.productosPorPagina);
            if ($scope.pagina === 1 || $scope.pagina - Math.floor(paginasMostradas / 2) <= 0) {
                //Si es la primera pagina
                for (var i = 1; i <= paginasMostradas && i <= totalPaginas; i++) {
                    $scope.paginas.push(i);
                }
            } else if ($scope.pagina === totalPaginas || $scope.pagina + Math.floor(paginasMostradas / 2) > totalPaginas) {
                //Si es la ultima pagina
                for (var i = totalPaginas; i > totalPaginas - paginasMostradas && i > 0; i--) {
                    $scope.paginas.unshift(i);
                }
            } else {
                //Si es una pagina intermedia
                for (var i = $scope.pagina - Math.floor(paginasMostradas / 2); i < $scope.pagina + paginasMostradas; i++) {
                    $scope.paginas.push(i);
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

        listarCiudades = function () {
            $scope.ciudades = [];
            $http.get(appParameters.urlRest + 'baruapplication/listarciudades').then(
                function (response) {
                    if (response.data) {
                        $scope.ciudades = response.data;
                    }
                },
                function (response) {
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
    });
})();
