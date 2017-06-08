(function () {
    var app = angular.module('ListaRegalos', []);
    app.controller('EditController', function ($scope, $http) {
        $scope.mensajeErrorModificacion = '';
        $scope.datosSesion = null;
        $scope.lista = {
            productos: [],
            mensajeBienvenida: ''
        };
        $scope.rutaImagenPortada = '../images/img_portada.jpg';
        $scope.rutaImagenPerfil = '../images/img_perfil.jpg';
        $scope.creadores = null;
        $scope.diasFaltantes = 0;
        $scope.referenciaSeleccionada = '';
        $scope.procesandoModificacion = false;
        $scope.totalBonos = 0;
        //Variables para paginacion
        $scope.totalProductos = 1;
        $scope.pagina = 1;
        $scope.totalProductos = 1;
        $scope.productosPorPaginaTxt = 12;
        $scope.productosPorPagina = 12;
        $scope.ordenarPor = 'favorito';
        $scope.ordenarPorTxt = 'Favoritos'
        $scope.paginas = [];
        //Variables para modal producto
        $scope.indiceProducto = 0;
        $scope.idProductoSeleccionado = 0;
        $scope.cantidadElegidaProducto = 0;
        $scope.cantidadCompradaProducto = 0;
        $scope.referenciaSeleccionada = '';
        $scope.mensajeAgradecimientoProducto = '';
        $scope.nombreProducto = '';
        $scope.descripcionProducto = '';
        $scope.precioProducto = 0;
        $scope.favoritoProducto = false;
        $scope.imagenVisible = 0;
        $scope.listaImagenes = [];
        //Variables para modal eliminar
        $scope.indiceProductoEliminar = 0;
        //Variables para modal escanear
        $scope.referenciaScan = '';
        $scope.errorScan = false;
        $scope.mensajeErrorScan = '';
        $scope.productoScan = null;
        $scope.cantidadAgregar = 1;

        $scope.mostrarInformacion = false;

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

        $scope.VolverAtras = function () {
            window.location.href = appParameters.urlSite + 'pages/admin_lista.html?sesion=' +
                $scope.datosSesion.idSession;
        };

        $scope.obtenerNombresCreadores = function (lista) {
            if (lista == null || typeof lista.idLista === 'undefined' || lista.idLista === null) {
                return;
            }
            return lista.nombreCreador + ((lista.nombreCocreador !== null && lista.nombreCocreador.length > 0) ? ' y ' + lista.nombreCocreador : '');
        };

        $scope.guardarNombreBienvenida = function () {
            if ($scope.lista.nombre === null || $scope.lista.nombre.trim().length === 0) {
                //TODO: mostrar mensaje de error al usuario
                console.error('no se puede modificar el nombre de la lista por un nombre vacio');
                return;
            }
            if ($scope.lista.mensajeBienvenida === null || $scope.lista.mensajeBienvenida.trim().length === 0) {
                //TODO: mostrar mensaje de error al usuario
                console.error('no se puede modificar el mensaje de bienvenida de la lista por un mensaje vacio');
                return;
            }
            $http.post(appParameters.urlRest + 'listaregalos/modificar', $scope.lista).then(
                function (response) {
                    if (response.data) {
                        if (response.data.codigo === 0) {
                            $('#modalNombreBienvenida').modal('hide');
                        }
                        console.log(response);
                    } else {
                        //TODO: mostrar mensaje de error al usuario
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

        $scope.mostrarModalNombreBienvenida = function () {
            $('#modalNombreBienvenida').modal({
                keyboard: false,
                backdrop: 'static'
            });
        };

        $scope.irAEditar = function () {
            window.location.href = appParameters.urlSite + 'pages/editar_informacion.html?sesion=' +
                $scope.datosSesion.idSession + '&codigo=' + obtenerValorParametro('codigo');
        };

        $scope.cambiarProductosPorPagina = function (valor) {
            if (valor === 20000) {
                $scope.productosPorPaginaTxt = 'Todos';
            } else {
                $scope.productosPorPaginaTxt = valor;
            }
            $scope.productosPorPagina = valor;
            $scope.pagina = 1;
            consultarPaginas();
            consultarProductos();
        };

        $scope.cambiarOrdenamiento = function (valorTxt, valor) {
            $scope.ordenarPorTxt = valorTxt;
            $scope.ordenarPor = valor;
            $scope.pagina = 1;
            consultarProductos();
        };

        $scope.cambiarPagina = function (valor) {
            if (valor <= 0 || valor > $scope.paginas[$scope.paginas.length - 1]) {
                return;
            }
            $scope.pagina = valor;
            calcularPaginas();
            consultarProductos();
        };

        $scope.mostrarModalProducto = function (indice) {
            if (!$("#carrusel_producto").hasClass('carousel')) {
                $("#carrusel_producto").addClass('carousel slide');
            }
            $scope.indiceProducto = indice;
            $scope.referenciaSeleccionada = $scope.lista.productos[indice].referencia;
            $scope.precioProducto = $scope.lista.productos[indice].precio;
            $scope.favoritoProducto = $scope.lista.productos[indice].favorito;
            $scope.idProductoSeleccionado = $scope.lista.productos[indice].idProductoLista;
            $scope.cantidadCompradaProducto = $scope.lista.productos[indice].cantidadComprada;
            $scope.cantidadElegidaProducto = $scope.lista.productos[indice].cantidadElegida;
            $scope.mensajeAgradecimientoProducto = $scope.lista.productos[indice].mensajeAgradecimiento;

            consultarNombreDesc();
            consultarImagenesProducto();

            $("#modalProducto").modal('show');
        }

        $scope.cambiarValorFavoritoProducto = function (idProducto, indice) {
            if ($scope.lista.productos[indice].cantidadComprada === $scope.lista.productos[indice].cantidadElegida) {
                return;
            }
            $scope.lista.productos[indice].favorito = !$scope.lista.productos[indice].favorito;
            $scope.favoritoProducto = !$scope.favoritoProducto;
            $http.get(appParameters.urlRest + 'listaregalos/cambiarfavorito/' + idProducto);
        };

        $scope.mostrarConfirmacionEliminar = function (indice) {
            $scope.indiceProductoEliminar = indice;
            $("#modalEliminar").modal('show');
        };

        $scope.eliminarProducto = function () {
            var producto = {
                idProductoLista: $scope.lista.productos[$scope.indiceProductoEliminar].idProductoLista,
                idLista: $scope.lista.idLista,
                referencia: $scope.lista.productos[$scope.indiceProductoEliminar].referencia,
                cantidadElegida: 0
            };
            $http.post(appParameters.urlRest + 'listaregalos/modificarproducto', producto).then(
                function (response) {
                    if (response.data && response.data.codigo === 0) {
                        consultarProductos();
                    } else {
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

        $scope.modificarProducto = function () {
            $scope.procesandoModificacion = true;
            $scope.mensajeErrorModificacion = '';
            var producto = {
                idProductoLista: $scope.idProductoSeleccionado,
                idLista: $scope.lista.idLista,
                referencia: $scope.referenciaSeleccionada,
                cantidadElegida: $scope.cantidadElegidaProducto,
                mensajeAgradecimiento: $scope.mensajeAgradecimientoProducto,
                favorito: $scope.favoritoProducto
            };
            $http.post(appParameters.urlRest + 'listaregalos/modificarproducto', producto).then(
                function (response) {
                    $scope.procesandoModificacion = false;
                    if (response.data && response.data.codigo === 0) {
                        $("#modalProducto").modal('hide');
                        consultarProductos();
                    } else {
                        $scope.mensajeErrorModificacion = response.data.mensaje;
                        console.error(response.data);
                    }
                },
                function (response) {
                    $scope.procesandoModificacion = false;
                    //TODO: mostrar mensaje de error
                    console.error(response);
                    return;
                }
            );
        };

        $scope.agregarProductos = function () {
            window.location.href = appParameters.urlSite + 'pages/agregar-productos.html?sesion=' +
                $scope.datosSesion.idSession + '&codigo=' + obtenerValorParametro('codigo');
        };

        $scope.configurarImagenPredeterminada = function (nombreImagen, tipoImagen) {
            $http.get(appParameters.urlRest + 'listaregalos/cambiarimagen/' + obtenerValorParametro('codigo') + '/' + nombreImagen + '/' + tipoImagen).then(
                function (response) {
                    $('#modalImagenes').modal('hide');
                    consultarLista();
                },
                function (response) {
                    console.error(response);
                    return;
                }
            );
        };

        $scope.mostrarPanelBarcode = function () {
            $('#modalItemBarcode').modal({
                show: true,
                backdrop: 'static'
            });
        };

        $scope.buscarReferencia = function (event) {
            if (event.which != 13) {
                return;
            }
            $scope.cantidadAgregar = 1;
            $scope.productoScan = null;
            $scope.errorScan = false;
            $scope.mensajeErrorScan = '';
            if ($scope.referenciaScan.length < 5) {
                $scope.errorScan = true;
                $scope.mensajeErrorScan = 'La referencia ingresada no es válida';
                return;
            }
            $http.get(appParameters.urlRest + 'listaregalos/consultareferencia/' + $scope.lista.idLista + '/' + encodeURIComponent($scope.referenciaScan)).then(
                function (response) {
                    if (response.data) {
                        $scope.productoScan = response.data;
                    } else {
                        $scope.errorScan = true;
                        $scope.mensajeErrorScan = 'No se encontró ningún producto con la referencia ingresada';
                    }
                    $scope.referenciaScan = '';
                },
                function (response) {
                    $scope.referenciaScan = '';
                }
            );
        };

        $scope.agregarProductoLista = function () {
            if ($scope.cantidadAgregar === null || $scope.cantidadAgregar <= 0) {
                $scope.mensajeErrorAgregarProducto = 'Debes indicar la cantidad que deseas del producto';
                return;
            }
            var datosProducto = {
                idLista: $scope.lista.idLista,
                referencia: $scope.productoScan.referencia,
                descripcionProducto: $scope.productoScan.descripcionProducto,
                favorito: false,
                cantidadElegida: $scope.cantidadAgregar,
                mensajeAgradecimiento: null
            };
            $http.post(appParameters.urlRest + 'listaregalos/agregarproducto', datosProducto).then(
                function (response) {
                    if (response.data) {
                        if (response.data.codigo === 0) {
                            $scope.productoScan = null;
                            $('#modalItemBarcode').modal('hide');
                            consultarPaginas();
                            consultarProductos();
                        } else {
                            $scope.mensajeErrorAgregarProducto = response.data.mensaje;
                            console.error(response.data.mensaje);
                        }
                    } else {
                        //TODO: mostrar mensaje de error
                        console.error(response);
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                }
            );
        };

        consultarNombreDesc = function () {
            $http.get(appParameters.urlRest + 'iteminventario/consultanombre/' + $scope.referenciaSeleccionada).then(
                function (response) {
                    if (response.data) {
                        $scope.nombreProducto = response.data.itemName;
                        $scope.descripcionProducto = response.data.udescripciona;
                        //calcularPaginas();
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                    return;
                }
            );
        };

        consultarImagenesProducto = function () {
            $scope.imagenVisible = 0;
            $scope.listaImagenes = [];
            $http.get(appParameters.urlRest + 'imagenes/listar/' + $scope.referenciaSeleccionada).then(
                function (response) {
                    if (response.data) {
                        $scope.listaImagenes = response.data;
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                    return;
                }
            );
        };

        getRandomInt = function (min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        };

        actualizarRutaImagenes = function () {
            if ($scope.lista.rutaImagenPortada != null && $scope.lista.rutaImagenPortada.length > 0) {
                $scope.rutaImagenPortada = $scope.lista.rutaImagenPortada + '?' + getRandomInt(0, 99999);
            }
            if ($scope.lista.rutaImagenPerfil != null && $scope.lista.rutaImagenPerfil.length > 0) {
                $scope.rutaImagenPerfil = $scope.lista.rutaImagenPerfil + '?' + getRandomInt(0, 99999);
            }
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
                                window.location.href = urlSite;
                            } else {
                                //1.2 Si el id es validado con exito, finaliza
                                $scope.datosSesion = response.data;
                                //var modalMostrar = obtenerValorParametro('modal');
                                //if (modalMostrar) {
                                //    $('#' + modalMostrar).modal('show');
                                //}
                                consultarLista();
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
                            actualizarRutaImagenes();
                            console.log($scope.lista);
                            $scope.creadores = obtenerNombresCreadores();
                            $scope.diasFaltantes = obtenerDiasFaltantes();
                            consultarPaginas();
                            consultarProductos();
                            consultarTotalBonos();
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

        consultarTotalBonos = function () {
            $http.get(appParameters.urlRest + 'listaregalos/consultarbonos/' + $scope.lista.idLista).then(
                function (response) {
                    $scope.totalBonos = response.data;
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    $scope.totalBonos = 0;
                    console.error(response);
                    return;
                }
            );
        };

        obtenerNombresCreadores = function () {
            if ($scope.lista == null || typeof $scope.lista.idLista === 'undefined' || $scope.lista.idLista === null) {
                return;
            }
            return $scope.lista.nombreCreador + (($scope.lista.nombreCocreador !== null && $scope.lista.nombreCocreador.length > 0) ? ' y ' + $scope.lista.nombreCocreador : '');
        };

        obtenerDiasFaltantes = function () {
            var today = new Date();
            var fechaEvento = new Date($scope.lista.fechaEvento);
            if (today > fechaEvento) {
                return 'Evento finalizado';
            }
            var one_day = 1000 * 60 * 60 * 24;
            //Calculate difference btw the two dates, and convert to days
            return Math.ceil((fechaEvento.getTime() - today.getTime()) / (one_day)) + ' Días';
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
                //if($scope.pagina - Math.floor(paginasMostradas/2) > 0 && $scope.pagina + Math.floor(paginasMostradas/2) <= totalPaginas) {
                for (var i = $scope.pagina - Math.floor(paginasMostradas / 2); i < $scope.pagina + paginasMostradas; i++) {
                    $scope.paginas.push(i);
                }
                //}
            }
        };

        consultarProductos = function () {
            var consulta = {
                idLista: $scope.lista.idLista,
                pagina: $scope.pagina,
                registrosPagina: $scope.productosPorPagina,
                orderBy: $scope.ordenarPor
            };
            $http.post(appParameters.urlRest + 'listaregalos/consultarproductos/', consulta).then(
                function (response) {
                    if (response.data && response.data.length > 0) {
                        $scope.referenciaSeleccionada = response.data[0].referencia;
                        $scope.lista.productos = response.data;
                        for (var i = 0; i < $scope.lista.productos.length; i++) {
                            $scope.lista.productos[i].mensajeError = '';
                            consultarPrecio(i, $scope.lista.productos[i]);
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

        consultarPrecio = function (posicion, producto) {
            if (typeof producto === 'undefined' || producto === null ||
                typeof producto.referencia === 'undefined' || producto.referencia === null || producto.referencia.length === 0) {
                return;
            }
            $http.get(appParameters.urlRest + 'iteminventario/consultaPrecio/' + producto.referencia).then(
                function (response) {
                    if (response.data && response.data[0] > 0) {
                        $scope.lista.productos[posicion].precio = response.data[0];
                        $scope.lista.productos[posicion].impuesto = response.data[1];
                        for (var j = 0; j < $scope.datosSesion.productos.length; j++) {
                            if ($scope.datosSesion.productos[j].idProductoLista === producto.idProductoLista) {
                                producto.cantidadComprar = $scope.datosSesion.productos[j].cantidad;
                                break;
                            }
                        }
                    } else {
                        $scope.lista.productos[posicion].precio = -1;
                    }
                },
                function (response) {
                    $scope.lista.productos[posicion].precio = -1;
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
