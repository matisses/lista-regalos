(function () {
    var app = angular.module('ListaRegalos', []);
    app.controller('AdminController', function ($scope, $http) {
        $scope.listaBorrar = {};
        $scope.creadorExiste = true;
        $scope.cocreadorExiste = true;
        $scope.mostrarInformacion = false;
        $scope.guardandoCreador = false;
        $scope.acepto = false;
        $scope.datosSesion = null;
        $scope.mensajeErrorCreador = '';
        $scope.mensajeErrorCocreador = '';
        $scope.mensajeErrorBusqueda = '';
        $scope.mensajeError = '';
        $scope.tipoEventoSeleccionado = '* Tipo de Evento';
        $scope.datosCreador = {};
        $scope.datosCocreador = {};
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
        $scope.tiposDocumento = [];
        $scope.listas = [];
        $scope.ciudades = [];
        $scope.textoBusquedaCiudad = '';
        $scope.ultimoEventoBusquedaCiudad = null;
        $scope.informacionLista = {
            activa: true,
            permitirEntregaPersonal: false,
            aceptaBonos: false,
            listaPrivada: false,
            permiteEntregaPersonal: false,
            notificacionInmediataCreador: 'N',
            notificacionDiariaCreador: 'N',
            notificacionSemanalCreador: 'N',
            notificacionCambioCategoriaCreador: 'N',
            notificacionInmediataCocreador: 'N',
            notificacionDiariaCocreador: 'N',
            notificacionSemanalCocreador: 'N',
            notificacionCambioCategoriaCocreador: 'N',
            tipoEvento: {
                idTipoEvento: 0
            }
        };
        $scope.paginas = [];
        $scope.datosPaginacion = {
            pagina: 1,
            registrosPagina: 5,
            orderBy: null
        };
        $scope.ordenarPor = 'fecha';
        $scope.ordenarPorTxt = 'Fecha del Evento'
        $scope.totalListas = 1;

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

        $scope.obtenerNombresCreadores = function (lista) {
            if (lista == null || typeof lista.idLista === 'undefined' || lista.idLista === null) {
                return;
            }
            return lista.nombreCreador + ((lista.nombreCocreador !== null && lista.nombreCocreador.length > 0) ? ' y ' + lista.nombreCocreador : '');
        };

        $scope.seleccionarTipoDocumento = function (tipo, componente) {
            if (componente === 'creador') {
                $scope.tipoDocumentoCreador = tipo;
                $scope.datosCreador.tipoDocumento = tipo.code;
            } else {
                $scope.tipoDocumentoCocreador = tipo;
                $scope.datosCocreador.tipoDocumento = tipo.code;
            }
        };

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
            //console.log('buscando ciudad ' + $scope.textoBusquedaCiudad);
            for (var i = 0; i < $scope.ciudades.length; i++) {
                if ($scope.ciudades[i].nombre.toLowerCase().startsWith($scope.textoBusquedaCiudad)) {
                    //console.log('encontro la ciudad ' + $scope.ciudades[i].nombre);
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

        $scope.cambiarListaPublicaPrivada = function () {
            $scope.informacionLista.listaPrivada = !$scope.informacionLista.listaPrivada;
        };

        $scope.cambiarNotificacionCreador = function (frecuencia, tipo) {
            if (frecuencia === 'I') {
                if (tipo === 'E') {
                    if ($scope.informacionLista.notificacionInmediataCreador === 'E') {
                        $scope.informacionLista.notificacionInmediataCreador = 'N';
                    } else if ($scope.informacionLista.notificacionInmediataCreador === 'N') {
                        $scope.informacionLista.notificacionInmediataCreador = 'E';
                    } else if ($scope.informacionLista.notificacionInmediataCreador === 'T') {
                        $scope.informacionLista.notificacionInmediataCreador = 'S';
                    } else if ($scope.informacionLista.notificacionInmediataCreador === 'S') {
                        $scope.informacionLista.notificacionInmediataCreador = 'T';
                    }
                } else {
                    if ($scope.informacionLista.notificacionInmediataCreador === 'E') {
                        $scope.informacionLista.notificacionInmediataCreador = 'T';
                    } else if ($scope.informacionLista.notificacionInmediataCreador === 'N') {
                        $scope.informacionLista.notificacionInmediataCreador = 'S';
                    } else if ($scope.informacionLista.notificacionInmediataCreador === 'T') {
                        $scope.informacionLista.notificacionInmediataCreador = 'E';
                    } else if ($scope.informacionLista.notificacionInmediataCreador === 'S') {
                        $scope.informacionLista.notificacionInmediataCreador = 'N';
                    }
                }
            } else if (frecuencia === 'D') {
                if (tipo === 'E') {
                    if ($scope.informacionLista.notificacionDiariaCreador === 'E') {
                        $scope.informacionLista.notificacionDiariaCreador = 'N';
                    } else if ($scope.informacionLista.notificacionDiariaCreador === 'N') {
                        $scope.informacionLista.notificacionDiariaCreador = 'E';
                    } else if ($scope.informacionLista.notificacionDiariaCreador === 'T') {
                        $scope.informacionLista.notificacionDiariaCreador = 'S';
                    } else if ($scope.informacionLista.notificacionDiariaCreador === 'S') {
                        $scope.informacionLista.notificacionDiariaCreador = 'T';
                    }
                } else {
                    if ($scope.informacionLista.notificacionDiariaCreador === 'E') {
                        $scope.informacionLista.notificacionDiariaCreador = 'T';
                    } else if ($scope.informacionLista.notificacionDiariaCreador === 'N') {
                        $scope.informacionLista.notificacionDiariaCreador = 'S';
                    } else if ($scope.informacionLista.notificacionDiariaCreador === 'T') {
                        $scope.informacionLista.notificacionDiariaCreador = 'E';
                    } else if ($scope.informacionLista.notificacionDiariaCreador === 'S') {
                        $scope.informacionLista.notificacionDiariaCreador = 'N';
                    }
                }
            } else if (frecuencia === 'S') {
                if (tipo === 'E') {
                    if ($scope.informacionLista.notificacionSemanalCreador === 'E') {
                        $scope.informacionLista.notificacionSemanalCreador = 'N';
                    } else if ($scope.informacionLista.notificacionSemanalCreador === 'N') {
                        $scope.informacionLista.notificacionSemanalCreador = 'E';
                    } else if ($scope.informacionLista.notificacionSemanalCreador === 'T') {
                        $scope.informacionLista.notificacionSemanalCreador = 'S';
                    } else if ($scope.informacionLista.notificacionSemanalCreador === 'S') {
                        $scope.informacionLista.notificacionSemanalCreador = 'T';
                    }
                } else {
                    if ($scope.informacionLista.notificacionSemanalCreador === 'E') {
                        $scope.informacionLista.notificacionSemanalCreador = 'T';
                    } else if ($scope.informacionLista.notificacionSemanalCreador === 'N') {
                        $scope.informacionLista.notificacionSemanalCreador = 'S';
                    } else if ($scope.informacionLista.notificacionSemanalCreador === 'T') {
                        $scope.informacionLista.notificacionSemanalCreador = 'E';
                    } else if ($scope.informacionLista.notificacionSemanalCreador === 'S') {
                        $scope.informacionLista.notificacionSemanalCreador = 'N';
                    }
                }
            } else if (frecuencia === 'C') {
                if (tipo === 'E') {
                    if ($scope.informacionLista.notificacionCambioCategoriaCreador === 'E') {
                        $scope.informacionLista.notificacionCambioCategoriaCreador = 'N';
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'N';
                    } else if ($scope.informacionLista.notificacionCambioCategoriaCreador === 'N') {
                        $scope.informacionLista.notificacionCambioCategoriaCreador = 'E';
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'E';
                    } else if ($scope.informacionLista.notificacionCambioCategoriaCreador === 'T') {
                        $scope.informacionLista.notificacionCambioCategoriaCreador = 'S';
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'S';
                    } else if ($scope.informacionLista.notificacionCambioCategoriaCreador === 'S') {
                        $scope.informacionLista.notificacionCambioCategoriaCreador = 'T';
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'T';
                    }
                } else {
                    if ($scope.informacionLista.notificacionCambioCategoriaCreador === 'E') {
                        $scope.informacionLista.notificacionCambioCategoriaCreador = 'T';
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'T';
                    } else if ($scope.informacionLista.notificacionCambioCategoriaCreador === 'N') {
                        $scope.informacionLista.notificacionCambioCategoriaCreador = 'S';
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'S';
                    } else if ($scope.informacionLista.notificacionCambioCategoriaCreador === 'T') {
                        $scope.informacionLista.notificacionCambioCategoriaCreador = 'E';
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'E';
                    } else if ($scope.informacionLista.notificacionCambioCategoriaCreador === 'S') {
                        $scope.informacionLista.notificacionCambioCategoriaCreador = 'N';
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'N';
                    }
                }
            }
            validarEstadoNotificaciones();
        };

        $scope.cambiarNotificacionCocreador = function (frecuencia, tipo) {
            if (frecuencia === 'I') {
                if (tipo === 'E') {
                    if ($scope.informacionLista.notificacionInmediataCocreador === 'E') {
                        $scope.informacionLista.notificacionInmediataCocreador = 'N';
                    } else if ($scope.informacionLista.notificacionInmediataCocreador === 'N' ||
                        $scope.informacionLista.notificacionInmediataCocreador === null) {
                        $scope.informacionLista.notificacionInmediataCocreador = 'E';
                    } else if ($scope.informacionLista.notificacionInmediataCocreador === 'T') {
                        $scope.informacionLista.notificacionInmediataCocreador = 'S';
                    } else if ($scope.informacionLista.notificacionInmediataCocreador === 'S') {
                        $scope.informacionLista.notificacionInmediataCocreador = 'T';
                    }
                } else {
                    if ($scope.informacionLista.notificacionInmediataCocreador === 'E') {
                        $scope.informacionLista.notificacionInmediataCocreador = 'T';
                    } else if ($scope.informacionLista.notificacionInmediataCocreador === 'N' ||
                        $scope.informacionLista.notificacionInmediataCocreador === null) {
                        $scope.informacionLista.notificacionInmediataCocreador = 'S';
                    } else if ($scope.informacionLista.notificacionInmediataCocreador === 'T') {
                        $scope.informacionLista.notificacionInmediataCocreador = 'E';
                    } else if ($scope.informacionLista.notificacionInmediataCocreador === 'S') {
                        $scope.informacionLista.notificacionInmediataCocreador = 'N';
                    }
                }
            } else if (frecuencia === 'D') {
                if (tipo === 'E') {
                    if ($scope.informacionLista.notificacionDiariaCocreador === 'E') {
                        $scope.informacionLista.notificacionDiariaCocreador = 'N';
                    } else if ($scope.informacionLista.notificacionDiariaCocreador === 'N' ||
                        $scope.informacionLista.notificacionDiariaCocreador === null) {
                        $scope.informacionLista.notificacionDiariaCocreador = 'E';
                    } else if ($scope.informacionLista.notificacionDiariaCocreador === 'T') {
                        $scope.informacionLista.notificacionDiariaCocreador = 'S';
                    } else if ($scope.informacionLista.notificacionDiariaCocreador === 'S') {
                        $scope.informacionLista.notificacionDiariaCocreador = 'T';
                    }
                } else {
                    if ($scope.informacionLista.notificacionDiariaCocreador === 'E') {
                        $scope.informacionLista.notificacionDiariaCocreador = 'T';
                    } else if ($scope.informacionLista.notificacionDiariaCocreador === 'N' ||
                        $scope.informacionLista.notificacionDiariaCocreador === null) {
                        $scope.informacionLista.notificacionDiariaCocreador = 'S';
                    } else if ($scope.informacionLista.notificacionDiariaCocreador === 'T') {
                        $scope.informacionLista.notificacionDiariaCocreador = 'E';
                    } else if ($scope.informacionLista.notificacionDiariaCocreador === 'S') {
                        $scope.informacionLista.notificacionDiariaCocreador = 'N';
                    }
                }
            } else if (frecuencia === 'S') {
                if (tipo === 'E') {
                    if ($scope.informacionLista.notificacionSemanalCocreador === 'E') {
                        $scope.informacionLista.notificacionSemanalCocreador = 'N';
                    } else if ($scope.informacionLista.notificacionSemanalCocreador === 'N' ||
                        $scope.informacionLista.notificacionSemanalCocreador === null) {
                        $scope.informacionLista.notificacionSemanalCocreador = 'E';
                    } else if ($scope.informacionLista.notificacionSemanalCocreador === 'T') {
                        $scope.informacionLista.notificacionSemanalCocreador = 'S';
                    } else if ($scope.informacionLista.notificacionSemanalCocreador === 'S') {
                        $scope.informacionLista.notificacionSemanalCocreador = 'T';
                    }
                } else {
                    if ($scope.informacionLista.notificacionSemanalCocreador === 'E') {
                        $scope.informacionLista.notificacionSemanalCocreador = 'T';
                    } else if ($scope.informacionLista.notificacionSemanalCocreador === 'N' ||
                        $scope.informacionLista.notificacionSemanalCocreador === null) {
                        $scope.informacionLista.notificacionSemanalCocreador = 'S';
                    } else if ($scope.informacionLista.notificacionSemanalCocreador === 'T') {
                        $scope.informacionLista.notificacionSemanalCocreador = 'E';
                    } else if ($scope.informacionLista.notificacionSemanalCocreador === 'S') {
                        $scope.informacionLista.notificacionSemanalCocreador = 'N';
                    }
                }
            } else if (frecuencia === 'C') {
                if (tipo === 'E') {
                    if ($scope.informacionLista.notificacionCambioCategoriaCocreador === 'E') {
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'N';
                    } else if ($scope.informacionLista.notificacionCambioCategoriaCocreador === 'N' ||
                        $scope.informacionLista.notificacionCambioCategoriaCocreador === null) {
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'E';
                    } else if ($scope.informacionLista.notificacionCambioCategoriaCocreador === 'T') {
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'S';
                    } else if ($scope.informacionLista.notificacionCambioCategoriaCocreador === 'S') {
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'T';
                    }
                } else {
                    if ($scope.informacionLista.notificacionCambioCategoriaCocreador === 'E') {
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'T';
                    } else if ($scope.informacionLista.notificacionCambioCategoriaCocreador === 'N' ||
                        $scope.informacionLista.notificacionCambioCategoriaCocreador === null) {
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'S';
                    } else if ($scope.informacionLista.notificacionCambioCategoriaCocreador === 'T') {
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'E';
                    } else if ($scope.informacionLista.notificacionCambioCategoriaCocreador === 'S') {
                        $scope.informacionLista.notificacionCambioCategoriaCocreador = 'N';
                    }
                }
            }
            validarEstadoNotificaciones();
        };

        $scope.obtenerCategoria = function (idCategoria) {
            switch (idCategoria) {
                case 1:
                    return 'basic';
                case 2:
                    return 'medium';
                case 3:
                    return 'premium';
                default:
                    return 'basic';
            }
        };

        validarEstadoNotificaciones = function () {
            $scope.notiInmediataSMSCreador = $scope.informacionLista.notificacionInmediataCreador === 'T' || $scope.informacionLista.notificacionInmediataCreador === 'S';
            $scope.notiInmediataEmailCreador = $scope.informacionLista.notificacionInmediataCreador === 'T' || $scope.informacionLista.notificacionInmediataCreador === 'E';
            $scope.notiDiariaSMSCreador = $scope.informacionLista.notificacionDiariaCreador === 'T' || $scope.informacionLista.notificacionDiariaCreador === 'S';
            $scope.notiDiariaEmailCreador = $scope.informacionLista.notificacionDiariaCreador === 'T' || $scope.informacionLista.notificacionDiariaCreador === 'E';
            $scope.notiSemanalSMSCreador = $scope.informacionLista.notificacionSemanalCreador === 'T' || $scope.informacionLista.notificacionSemanalCreador === 'S';
            $scope.notiSemanalEmailCreador = $scope.informacionLista.notificacionSemanalCreador === 'T' || $scope.informacionLista.notificacionSemanalCreador === 'E';
            $scope.notiCategoriaSMSCreador = $scope.informacionLista.notificacionCambioCategoriaCreador === 'T' || $scope.informacionLista.notificacionCambioCategoriaCreador === 'S';
            $scope.notiCategoriaEmailCreador = $scope.informacionLista.notificacionCambioCategoriaCreador === 'T' || $scope.informacionLista.notificacionCambioCategoriaCreador === 'E';

            $scope.notiInmediataSMSCocreador = $scope.informacionLista.notificacionInmediataCocreador === 'T' || $scope.informacionLista.notificacionInmediataCocreador === 'S';
            $scope.notiInmediataEmailCocreador = $scope.informacionLista.notificacionInmediataCocreador === 'T' || $scope.informacionLista.notificacionInmediataCocreador === 'E';
            $scope.notiDiariaSMSCocreador = $scope.informacionLista.notificacionDiariaCocreador === 'T' || $scope.informacionLista.notificacionDiariaCocreador === 'S';
            $scope.notiDiariaEmailCocreador = $scope.informacionLista.notificacionDiariaCocreador === 'T' || $scope.informacionLista.notificacionDiariaCocreador === 'E';
            $scope.notiSemanalSMSCocreador = $scope.informacionLista.notificacionSemanalCocreador === 'T' || $scope.informacionLista.notificacionSemanalCocreador === 'S';
            $scope.notiSemanalEmailCocreador = $scope.informacionLista.notificacionSemanalCocreador === 'T' || $scope.informacionLista.notificacionSemanalCocreador === 'E';
            $scope.notiCategoriaSMSCocreador = $scope.notiCategoriaSMSCreador;
            $scope.notiCategoriaEmailCocreador = $scope.notiCategoriaEmailCreador;
        };

        $scope.alternarAceptaBonos = function () {
            $scope.informacionLista.aceptaBonos = !$scope.informacionLista.aceptaBonos;
        };

        $scope.alternarEntregaPersonal = function () {
            $scope.informacionLista.permitirEntregaPersonal = !$scope.informacionLista.permitirEntregaPersonal;
        };

        $scope.seleccionarTipoEvento = function (tipo, descTipo) {
            $scope.informacionLista.tipoEvento.idTipoEvento = tipo;
            $scope.tipoEventoSeleccionado = descTipo;
        };

        $scope.seleccionarCiudad = function (ciudad, idComponent) {
            if (idComponent === 'listaCiudades') {
                $scope.ciudadCreadorSeleccionada = ciudad;
            } else {
                $scope.ciudadCocreadorSeleccionada = ciudad;
            }
        }

        $scope.consultarCliente = function (documento, tipo) {
            if (typeof documento != 'undefined' && documento.length > 0) {
                $http.get(appParameters.urlRest + 'sociodenegocios/' + (documento.endsWith('CL') ? documento : documento + 'CL')).then(
                    function (response) {
                        if (response.data) {
                            var datosCliente = {
                                nombres: response.data.firstName,
                                apellido1: response.data.lastName1,
                                apellido2: response.data.lastName2,
                                licTradNum: response.data.fiscalID,
                            };
                            for (var i = 0; i < response.data.addresses.length; i++) {
                                if (response.data.addresses[i].addressName === response.data.defaultBillingAddress) {
                                    datosCliente.email = response.data.addresses[i].email;
                                    datosCliente.celular = response.data.addresses[i].cellphone;
                                    //datosCliente.direccion = response.data.addresses[i].address;
                                    //datosCliente.ciudad = response.data.addresses[i].cityName;
                                    //for (var j = 0; j < $scope.ciudades.length; j++) {
                                    //    if ($scope.ciudades[j].codigo === response.data.addresses[i].cityCode) {
                                    //        $scope.ciudadSeleccionada = $scope.ciudades[j];
                                    //        break;
                                    //    }
                                    //}
                                    break;
                                }
                            }
                            for (var j = 0; j < $scope.tiposDocumento.length; j++) {
                                if ($scope.tiposDocumento[j].code === response.data.fiscalIdTypeStr) {
                                    if (tipo === 'CR') {
                                        $scope.tipoDocumentoCreador = $scope.tiposDocumento[j];
                                    } else {
                                        $scope.tipoDocumentoCocreador = $scope.tiposDocumento[j];
                                    }
                                    break;
                                }
                            }
                            if (tipo === 'CR') {
                                $scope.creadorExiste = true;
                                $scope.datosCreador = datosCliente;
                            } else {
                                $scope.cocreadorExiste = true;
                                $scope.datosCocreador = datosCliente;
                            }
                        } else {
                            //TODO: mostrar mensaje error
                            if (tipo === 'CR') {
                                $scope.creadorExiste = false;
                                limpiarDatosCreador(documento);
                            } else {
                                $scope.cocreadorExiste = false;
                                limpiarDatosCocreador(documento);
                            }
                        }
                    },
                    function (response) {
                        //TODO: mostrar mensaje de error
                        console.error(response);
                        if (tipo === 'CR') {
                            $scope.creadorExiste = false;
                            limpiarDatosCreador(documento);
                        } else {
                            $scope.cocreadorExiste = false;
                            limpiarDatosCocreador(documento);
                        }
                        return;
                    }
                );
            } else {
                if (tipo === 'CR') {
                    $scope.creadorExiste = false;
                    limpiarDatosCreador(documento);
                } else {
                    //$scope.cocreadorExiste = false;
                    limpiarDatosCocreador(documento);
                }
            }
        };

        $scope.crearClienteCreador = function () {
            if (!validarCreador()) {
                return;
            }
            $scope.guardandoCreador = true;
            var socioDeNegocios = {
                usuario: 'lista-regalos',
                regimen: 'RC',
                autorretenedor: 'N',
                nacionalidad: '01',
                tipoPersona: '01',
                codAsesor: '98',
                sexo: 3, //TODO: mapear con campo
                tipoDocumento: '13', //TODO: mapear con campo 13=CC, 22=C.E., 41=pasaporte
                tipoExtranjero: '-',
                tipoDocumento: $scope.tipoDocumentoCreador.code,
                nit: $scope.datosCreador.licTradNum,
                email: $scope.datosCreador.email,
                //primerNombre: $scope.datosCreador.nombres,
                nombres: $scope.datosCreador.nombres,
                apellido1: $scope.datosCreador.apellido1,
                apellido2: $scope.datosCreador.apellido2,
                celular: $scope.datosCreador.celular,
                razonSocial: $scope.datosCreador.apellido1 + ' ' + $scope.datosCreador.apellido2 + ' ' + $scope.datosCreador.nombres
            };
            $http.post(appParameters.urlRest + 'sociodenegocios/', socioDeNegocios).then(
                function (response) {
                    if (response.data && response.data.codigo != '0') {
                        if (response.data && response.data.mensaje && response.data.mensaje.length > 0) {
                            $scope.mensajeErrorCreador = response.data.mensaje;
                        } else {
                            $scope.mensajeErrorCreador = 'Ocurrió un error desconocido. Por favor espera un momento y vuelve a intentarlo.';
                        }
                        $scope.creadorExiste = false;
                    } else {
                        $scope.creadorExiste = true;
                    }
                    $scope.guardandoCreador = false;
                },
                function (response) {
                    $scope.guardandoCreador = false;
                    $scope.creadorExiste = false;
                    $scope.mensajeErrorCreador = 'Ocurrió un error al registrar los datos del creador. Por favor espera un momento y vuelve a intentarlo.';
                }
            );
        };

        $scope.crearClienteCocreador = function () {
            if (!validarCocreador()) {
                return;
            }
            $scope.guardandoCocreador = true;
            var socioDeNegocios = {
                usuario: 'lista-regalos',
                regimen: 'RC',
                autorretenedor: 'N',
                nacionalidad: '01',
                tipoPersona: '01',
                codAsesor: '98',
                sexo: 3, //TODO: mapear con campo
                tipoDocumento: '13', //TODO: mapear con campo 13=CC, 22=C.E., 41=pasaporte
                tipoExtranjero: '-',
                tipoDocumento: $scope.tipoDocumentoCocreador.code,
                nit: $scope.datosCocreador.licTradNum,
                email: $scope.datosCocreador.email,
                primerNombre: $scope.datosCocreador.nombres,
                apellido1: $scope.datosCocreador.apellido1,
                apellido2: $scope.datosCocreador.apellido2,
                celular: $scope.datosCocreador.celular,
                razonSocial: $scope.datosCocreador.apellido1 + ' ' + $scope.datosCocreador.apellido2 + ' ' + $scope.datosCocreador.nombres
            };
            $http.post(appParameters.urlRest + 'sociodenegocios/', socioDeNegocios).then(
                function (response) {
                    if (response.data && response.data.codigo != '0') {
                        if (response.data && response.data.mensaje && response.data.mensaje.length > 0) {
                            $scope.mensajeErrorCocreador = response.data.mensaje;
                        } else {
                            $scope.mensajeErrorCocreador = 'Ocurrió un error desconocido. Por favor espera un momento y vuelve a intentarlo.';
                        }
                        $scope.cocreadorExiste = false;
                    } else {
                        $scope.cocreadorExiste = true;
                    }
                    $scope.guardandoCocreador = false;
                },
                function (response) {
                    $scope.guardandoCocreador = false;
                    $scope.cocreadorExiste = false;
                    $scope.mensajeErrorCreador = 'Ocurrió un error al registrar los datos del cocreador. Por favor espera un momento y vuelve a intentarlo.';
                }
            );
        };

        $scope.mostrarPanelBorrar = function (lista) {
            $scope.listaBorrar = lista;
            $('#modalBorrar').modal('show');
        };

        $scope.desactivarLista = function () {
            $http.get(appParameters.urlRest + 'listaregalos/desactivar/' + $scope.listaBorrar.codigo).then(
                function (response) {
                    consultarPaginas();
                    consultarListasUsuario();
                },
                function (response) {
                    console.error(response);
                }
            );
        };

        validarCreador = function () {
            $scope.mensajeErrorCreador = '';
            //Validar datos del creador
            if ($scope.datosCreador.licTradNum === null || $scope.datosCreador.licTradNum.length === 0) {
                console.error('el numero de documento del creador es obligatorio');
                $scope.mensajeErrorCreador = 'El número de documento del creador es obligatorio';
                return false;
            }
            if ($scope.tipoDocumentoCreador === null || $scope.tipoDocumentoCreador.name.length === 0 ||
                $scope.tipoDocumentoCreador.name === '* Tipo de Documento') {
                console.error('el tipo de documento del creador es obligatorio');
                $scope.mensajeErrorCreador = 'El tipo de documento del creador es obligatorio';
                return false;
            }
            if ($scope.datosCreador.nombres === null || typeof $scope.datosCreador.nombres === 'undefined' ||
                $scope.datosCreador.nombres.length === 0) {
                console.error('el nombre del creador es obligatorio');
                $scope.mensajeErrorCreador = 'El nombre del creador es obligatorio';
                return false;
            }
            if ($scope.datosCreador.apellido1 === null || typeof $scope.datosCreador.apellido1 === 'undefined' ||
                $scope.datosCreador.apellido1.length === 0) {
                console.error('el primer apellido del creador es obligatorio');
                $scope.mensajeErrorCreador = 'El primer apellido del creador es obligatorio';
                return false;
            }
            if ($scope.datosCreador.celular === null || typeof $scope.datosCreador.celular === 'undefined' ||
                $scope.datosCreador.celular.length === 0) {
                console.error('el numero de celular del creador es obligatorio');
                $scope.mensajeErrorCreador = 'El número de celular del creador es obligatorio';
                return false;
            }
            if ($scope.datosCreador.email === null || typeof $scope.datosCreador.email === 'undefined' ||
                $scope.datosCreador.email.length === 0) {
                console.error('el correo electrónico del creador es obligatorio');
                $scope.mensajeErrorCreador = 'El correo electrónico del creador es obligatorio';
                return false;
            }
            if ($scope.ciudadCreadorSeleccionada === null || typeof $scope.ciudadCreadorSeleccionada === 'undefined' ||
                $scope.ciudadCreadorSeleccionada.nombre.length === 0) {
                console.error('la ciudad del creador es obligatoria');
                $scope.mensajeErrorCreador = 'La ciudad del creador es obligatoria';
                return false;
            }
            return true;
        };

        validarCocreador = function () {
            $scope.mensajeErrorCreador = '';
            //Validar datos del creador
            if ($scope.datosCocreador.licTradNum === null || $scope.datosCocreador.licTradNum.length === 0) {
                console.error('el numero de documento del cocreador es obligatorio');
                $scope.mensajeErrorCocreador = 'El número de documento del cocreador es obligatorio';
                return false;
            }
            if ($scope.tipoDocumentoCocreador === null || $scope.tipoDocumentoCocreador.name.length === 0 ||
                $scope.tipoDocumentoCocreador.name === '* Tipo de Documento') {
                console.error('el tipo de documento del cocreador es obligatorio');
                $scope.mensajeErrorCocreador = 'El tipo de documento del cocreador es obligatorio';
                return false;
            }
            if ($scope.datosCocreador.nombres === null || typeof $scope.datosCocreador.nombres === 'undefined' ||
                $scope.datosCocreador.nombres.length === 0) {
                console.error('el nombre del cocreador es obligatorio');
                $scope.mensajeErrorCocreador = 'El nombre del cocreador es obligatorio';
                return false;
            }
            if ($scope.datosCocreador.apellido1 === null || typeof $scope.datosCocreador.apellido1 === 'undefined' ||
                $scope.datosCocreador.apellido1.length === 0) {
                console.error('el primer apellido del cocreador es obligatorio');
                $scope.mensajeErrorCocreador = 'El primer apellido del cocreador es obligatorio';
                return false;
            }
            if ($scope.datosCocreador.celular === null || typeof $scope.datosCocreador.celular === 'undefined' ||
                $scope.datosCocreador.celular.length === 0) {
                console.error('el numero de celular del cocreador es obligatorio');
                $scope.mensajeErrorCocreador = 'El número de celular del cocreador es obligatorio';
                return false;
            }
            if ($scope.datosCocreador.email === null || typeof $scope.datosCocreador.email === 'undefined' ||
                $scope.datosCocreador.email.length === 0) {
                console.error('el correo electrónico del cocreador es obligatorio');
                $scope.mensajeErrorCocreador = 'El correo electrónico del cocreador es obligatorio';
                return false;
            }
            if ($scope.ciudadCocreadorSeleccionada === null || typeof $scope.ciudadCocreadorSeleccionada === 'undefined' ||
                $scope.ciudadCocreadorSeleccionada.nombre.length === 0) {
                console.error('la ciudad del cocreador es obligatoria');
                $scope.mensajeErrorCocreador = 'La ciudad del cocreador es obligatoria';
                return false;
            }
            return true;
        };

        $scope.alternarAceptoTerminos = function () {
            $scope.acepto = !$scope.acepto;
            console.log($scope.acepto);
        };

        $scope.crearLista = function () {
            $scope.mensajeError = '';

            //Si el creador no existe en SAP, no puede continuar
            if (!$scope.creadorExiste) {
                return;
            }
            //TODO: validar datos del cocreador, si se ingresa alguno

            //Validar datos de la lista
            $('#nombre').removeClass('error');
            $('#dropTipoEvento').removeClass('error');
            $('#fechaEvento').removeClass('error');
            $('#monto').removeClass('error');
            $('#invitados').removeClass('error');
            $('#acepto').removeClass('error');
            if ($scope.informacionLista.nombre == null || $scope.informacionLista.nombre.trim().length === 0) {
                console.error('el nombre de la lista es obligatorio');
                $scope.mensajeError = 'El nombre de la lista es obligatorio';
                $('#nombre').addClass('error');
                return;
            }
            if ($scope.informacionLista.nombre.trim().length > 50) {
                console.error('el nombre de la lista es demasiado largo. ');
                $scope.mensajeError = 'El nombre de la lista es demasiado largo. Intenta no superar los 50 caracteres';
                $('#nombre').addClass('error');
                return;
            }
            if ($scope.informacionLista.tipoEvento == null || $scope.informacionLista.tipoEvento.idTipoEvento === 0) {
                console.error('el tipo de evento es obligatorio');
                $scope.mensajeError = 'El tipo de evento es obligatorio';
                $('#dropTipoEvento').addClass('error');
                return;
            }
            if ($scope.informacionLista.fechaEvento == null) {
                console.error('la fecha del evento es obligatoria');
                $scope.mensajeError = 'La fecha del evento es obligatoria';
                $('#fechaEvento').addClass('error');
                return;
            }
            if ($scope.informacionLista.fechaEvento < new Date()) {
                console.error('la fecha del evento no puede ser una fecha en el pasado');
                $scope.mensajeError = 'La fecha del evento no puede ser una fecha en el pasado';
                $('#fechaEvento').addClass('error');
                return;
            }
            if ($scope.informacionLista.aceptaBonos && (typeof $scope.informacionLista.valorMinimoBono === 'undefined' || $scope.informacionLista.valorMinimoBono <= 0)) {
                console.error('debes indicar el valor minimo para los bonos si indicas que deseas recibirlos');
                $scope.mensajeError = 'Debes indicar el valor mínimo para los bonos si indicas que deseas recibirlos';
                $('#monto').addClass('error');
                return;
            }
            if ($scope.informacionLista.aceptaBonos && ($scope.informacionLista.valorMinimoBono.length > 7)) {
                console.error('el valor minimo del bono es demasiado alto');
                $scope.mensajeError = 'El valor mínimo que ingresaste para el bono es demasiado alto';
                $('#monto').addClass('error');
                return;
            }
            if (typeof $scope.informacionLista.invitados === 'undefined' || $scope.informacionLista.invitados <= 0) {
                console.error('debes indicar el numero de invitados del evento');
                $scope.mensajeError = 'Debes indicar el número de invitados del evento';
                $('#invitados').addClass('error');
                return;
            }
            if (!$scope.acepto) {
                console.error('debes aceptar los terminos y condiciones de uso del sitio');
                $scope.mensajeError = 'Debes aceptar los términos y condiciones de uso del sitio';
                $('#acepto').addClass('error');
                return;
            }

            $scope.informacionLista.cedulaCreador = $scope.datosCreador.licTradNum;
            $scope.informacionLista.nombreCreador = $scope.datosCreador.nombres;
            $scope.informacionLista.apellidoCreador = $scope.datosCreador.apellido1 + ' ' + $scope.datosCreador.apellido2;

            $scope.informacionLista.cedulaCocreador = $scope.datosCocreador.licTradNum;
            $http.post(appParameters.urlRest + 'listaregalos/crear', $scope.informacionLista).then(
                function (response) {
                    if (response.data) {
                        if (response.data.codigo === 0) {
                            window.location.href = appParameters.urlSite + 'pages/editar_lista.html?sesion=' + $scope.datosSesion.idSession + '&codigo=' + response.data.mensaje;
                        } else {
                            $scope.mensajeError = 'Ocurrió un error al crear la lista. ';
                        }
                        console.log(response);
                    } else {
                        $scope.mensajeError = 'Ocurrió un error al crear la lista. ';
                        console.error(response);
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                    $scope.mensajeError = 'Ocurrió un error al crear la lista. ';
                    return;
                }
            );
        };

        $scope.editarLista = function (codigo) {
            window.location.href = appParameters.urlSite + 'pages/editar_lista.html?sesion=' + $scope.datosSesion.idSession + '&codigo=' + codigo;
        };

        $scope.obtenerDiasFaltantes = function (lista) {
            var today = new Date();
            var fechaEvento = new Date(lista.fechaEvento);
            if (today > fechaEvento) {
                return 'Evento finalizado';
            }
            var one_day = 1000 * 60 * 60 * 24;
            //Calculate difference btw the two dates, and convert to days
            return Math.ceil((fechaEvento.getTime() - today.getTime()) / (one_day)) + ' Días';
        };

        $scope.cambiarPagina = function (valor) {
            if (valor <= 0 || valor > $scope.paginas[$scope.paginas.length - 1]) {
                return;
            }
            $scope.datosPaginacion.pagina = valor;
            calcularPaginas();
            consultarListasUsuario();
        };

        limpiarDatosCreador = function (nroDoc) {
            $scope.datosCreador = {
                licTradNum: nroDoc
            };
            $scope.tipoDocumentoCreador = {
                name: '* Tipo de Documento'
            };
        }

        limpiarDatosCocreador = function (nroDoc) {
            $scope.datosCocreador = {
                licTradNum: nroDoc
            };
            $scope.tipoDocumentoCocreador = {
                name: '* Tipo de Documento'
            };
        }

        obtenerDatosSesion = function () {
            //Validar si la sesion ya fue inicializada (===null)
            if ($scope.datosSesion !== null) {
                //1 Si ya fue inicializada, invocar servicio para validar el id
                $http.get(appParameters.urlRest + 'listaregalos/sesion/' + $scope.datosSesion.idSesion).then(
                    function (response) {
                        if (response.data) {
                            if (!response.data.sesionValida) {
                                //1.1 Si el id no es validado con exito, debe redirigir a pagina de inicio
                                //window.location.href = urlSite;
                            } else {
                                //1.2 Si el id es validado con exito, finaliza
                                $scope.datosSesion = response.data;
                                consultarPaginas();
                                consultarListasUsuario();
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
                    consultarTiposDocumento();
                    listarCiudades();
                    obtenerDatosSesion();
                } else {
                    //2.2 Si no hay un codigo de sesion en el request, debe redirigir a pagina de inicio
                    //window.location.href = urlSite;
                }
            }
        };

        consultarPaginas = function () {
            var rutaServicio = 'listaregalos/'
            if ($scope.datosSesion.tipo === 'ADMINISTRADOR') {
                rutaServicio += 'consultartotallistasadmin';
            } else {
                rutaServicio += 'consultartotallistasusuario/' + $scope.datosSesion.cliente.nit;
            }
            $http.get(appParameters.urlRest + rutaServicio).then(
                function (response) {
                    if (response.data) {
                        $scope.totalListas = response.data;
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
            var totalPaginas = Math.ceil($scope.totalListas / $scope.datosPaginacion.registrosPagina);
            if ($scope.datosPaginacion.pagina === 1 || $scope.datosPaginacion.pagina - Math.floor(paginasMostradas / 2) <= 0) {
                //Si es la primera pagina
                for (var i = 1; i <= paginasMostradas && i <= totalPaginas; i++) {
                    $scope.paginas.push(i);
                }
            } else if ($scope.datosPaginacion.pagina === totalPaginas || $scope.datosPaginacion.pagina + Math.floor(paginasMostradas / 2) > totalPaginas) {
                //Si es la ultima pagina
                for (var i = totalPaginas; i > totalPaginas - paginasMostradas && i > 0; i--) {
                    $scope.paginas.unshift(i);
                }
            } else {
                //Si es una pagina intermedia
                for (var i = $scope.datosPaginacion.pagina - Math.floor(paginasMostradas / 2); i < $scope.datosPaginacion.pagina + paginasMostradas; i++) {
                    $scope.paginas.push(i);
                }
            }
        };

        consultarListasUsuario = function () {
            var consulta = {
                idSesion: obtenerValorParametro('sesion'),
                cedula: $scope.datosSesion.cliente.nit,
                paginacion: $scope.datosPaginacion
            };
            $http.post(appParameters.urlRest + 'listaregalos/consultarlistasusuario', consulta).then(
                function (response) {
                    if (response.data) {
                        $scope.mostrarInformacion = true;
                        if (response.data.codigo === 0) {
                            $scope.listas = response.data.listas;
                        } else {
                            $('#collapsiblePanel').collapse('show');
                        }
                        $scope.datosCreador = response.data.cliente;
                        for (var j = 0; j < $scope.ciudades.length; j++) {
                            if ($scope.ciudades[j].codigo === $scope.datosCreador.uBpcoCs) {
                                $scope.ciudadCreadorSeleccionada = $scope.ciudades[j];
                                break;
                            }
                        }
                        for (var j = 0; j < $scope.tiposDocumento.length; j++) {
                            if ($scope.tiposDocumento[j].code === $scope.datosCreador.tipoDocumento) {
                                $scope.tipoDocumentoCreador = $scope.tiposDocumento[j];
                                break;
                            }
                        }
                        console.log(response.data);
                    } else {
                        //TODO: mostrar mensaje error 
                        console.error(response.data);
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
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

        listarCiudades = function () {
            $scope.ciudades = [];
            //$http.get(appParameters.urlRest + 'baruapplication/listarciudades').then(
            //    function (response) {
            //        if (response.data) {
            //            $scope.ciudades = response.data;
            //        }
            //    },
            //    function (response) {
            //        return;
            //    }
            //);
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
