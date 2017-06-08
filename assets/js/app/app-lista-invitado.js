(function () {
    //var urlSite = 'http://192.168.5.189/lista-regalos/';
    //var urlRest = 'http://192.168.5.19:8080/360/webresources/';
    var app = angular.module('ListaRegalos', ['ngSanitize', 'ngAnimate']);
    app.controller('ListaInvitadoController', function ($scope, $http) {
        $scope.datosSesion = null;
        $scope.mostrarRegalo = false;
        $scope.codigoLista = '';
        $scope.creadores = '';
        $scope.diasFaltantes = '';
        $scope.lista = {};
        $scope.totalItemsEnCarrito = 0;
        $scope.pagina = 1;
        $scope.totalProductos = 1;
        $scope.referenciaSeleccionada = '';
        $scope.cantidadComprarProductoSeleccionado = '';
        $scope.rutaImagenPortada = '../images/img_portada.jpg';
        $scope.rutaImagenPerfil = '../images/img_perfil.jpg';
        $scope.productosPorPagina = 12;
        $scope.productosPorPaginaTxt = 12;
        $scope.ordenarPor = 'favorito';
        $scope.ordenarPorTxt = 'Favoritos'
        $scope.nombreProducto = '';
        $scope.descripcionProducto = '';
        $scope.imagenVisible = 0;
        $scope.listaImagenes = [];
        $scope.paginas = [];


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
            $scope.codigoLista = obtenerValorParametro('codigo');
            if (($scope.codigoLista === null || $scope.codigoLista.trim().length === 0)) {
                //Si no se envia el codigo de la lista en la URL, se redirige al home de listas de regalos
                clearInterval(estadoInterval);
                window.location.href = appParameters.urlSite;
            } else {
                obtenerDatosSesion();
                $scope.lista = {};
                $('#nombreBusqueda').removeClass('error');
                $('#apellidoBusqueda').removeClass('error');
                var consulta = {
                    codigo: $scope.codigoLista
                };

                $http.post(appParameters.urlRest + 'listaregalos/consultarlista/', consulta).then(
                    function (response) {
                        if (response.data) {
                            if (response.data.codigo === 0) {
                                $scope.lista = response.data.lista;
                                if ($scope.lista.rutaImagenPortada != null) {
                                    $scope.rutaImagenPortada = $scope.lista.rutaImagenPortada;
                                }
                                if ($scope.lista.rutaImagenPerfil != null) {
                                    $scope.rutaImagenPerfil = $scope.lista.rutaImagenPerfil;
                                }
                                if ($scope.lista.aceptaBonos) {
                                    $scope.productosPorPagina = $scope.productosPorPagina - 1;
                                }
                                console.log($scope.lista);
                                $scope.creadores = obtenerNombresCreadores();
                                $scope.diasFaltantes = obtenerDiasFaltantes();
                                consultarPaginas();
                                consultarProductos();
                                habilitarRegalo();
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
            }
        };

        $scope.cambiarProductosPorPagina = function (valor) {
            if (valor === 20000) {
                $scope.productosPorPaginaTxt = 'Todos';
            } else {
                $scope.productosPorPaginaTxt = valor;
            }
            $scope.productosPorPagina = valor - ($scope.lista.aceptaBonos ? 1 : 0);
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

        $scope.mostrarModalProducto = function (referencia) {
            if (!$("#carrusel_producto").hasClass('carousel')) {
                $("#carrusel_producto").addClass('carousel slide');
            }
            $scope.referenciaSeleccionada = referencia;
            consultarNombreDesc();
            consultarImagenesProducto();

            $("#modalProducto").modal('show');
        };

        $scope.sumarTotalItems = function () {
            if ($scope.datosSesion === null) {
                return;
            }
            $scope.totalItemsEnCarrito = 0;
            for (var i in $scope.datosSesion.productos) {
                $scope.totalItemsEnCarrito += $scope.datosSesion.productos[i].cantidad;
            }
            habilitarRegalo();
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
                    cantidad: producto.cantidadComprar,
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
                            $scope.sumarTotalItems();
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

        $scope.alternarCajaRegalo = function () {
            if ($scope.totalItemsEnCarrito === 0 && $scope.datosSesion.valorBono === 0) {
                $scope.totalItemsEnCarrito = 1;
            } else {
                $scope.totalItemsEnCarrito = 0;
                $scope.datosSesion.valorBono = 0;
            }
            habilitarRegalo();
        };

        $scope.agregarProductoModal = function () {
            for (var i = 0; i < $scope.lista.productos.length; i++) {
                if ($scope.lista.productos[i].referencia === $scope.referenciaSeleccionada) {
                    $scope.lista.productos[i].cantidadComprar = $scope.cantidadComprarProductoSeleccionado;
                    $scope.agregarProducto($scope.lista.productos[i]);
                    break;
                }
            }
            $scope.cantidadComprarProductoSeleccionado = '';
            $scope.nombreProducto = '';
            $scope.descripcionProducto = '';
            $scope.imagenVisible = 0;
            $scope.listaImagenes = [];
            $("#modalProducto").modal('hide');
        };

        $scope.agregarProducto = function (producto) {
            producto.mensajeError = '';
            if ($scope.datosSesion.valorBono > 0) {
                producto.mensajeError = 'No puedes agregar bonos y productos en la misma compra';
                return;
            }
            if (typeof producto.cantidadComprar === 'undefined' || producto.cantidadComprar < 0) {
                producto.mensajeError = 'Debes seleccionar al menos una unidad';
                return;
            }
            if (producto.cantidadComprar > producto.cantidadElegida - producto.cantidadComprada) {
                producto.mensajeError = 'Elegiste una cantidad mayor a la requerida por ' + obtenerNombresCreadores();
                return;
            }
            if (producto.cantidadComprar === 0) {
                $scope.eliminarProducto(producto);
                return;
            }
            var dto = {
                idSession: $scope.datosSesion.idSession,
                productos: [{
                    idProductoLista: producto.idProductoLista,
                    cantidad: producto.cantidadComprar,
                    precio: producto.precio,
                    impuesto: producto.impuesto,
                    referencia: producto.referencia
                }]
            };
            $http.post(appParameters.urlRest + 'listaregalos/comprarproducto/' + $scope.codigoLista, dto).then(
                function (response) {
                    if (response.data) {
                        if (response.data.codigo === 0) {
                            console.log('se guardaron correctamente los datos');
                            if ($scope.datosSesion.productos.length === 0) {
                                producto.cantidad = producto.cantidadComprar;
                                $scope.datosSesion.productos.push(producto);
                            } else {
                                var encontrado = false;
                                for (var i = 0; i < $scope.datosSesion.productos.length; i++) {
                                    if ($scope.datosSesion.productos[i].idProductoLista === producto.idProductoLista) {
                                        $scope.datosSesion.productos[i].cantidad = producto.cantidadComprar;
                                        encontrado = true;
                                        break;
                                    }
                                }
                                if (!encontrado) {
                                    producto.cantidad = producto.cantidadComprar;
                                    $scope.datosSesion.productos.push(producto);
                                }
                            }
                            $scope.sumarTotalItems();
                        } else if (response.data.codigo === 0) {
                            //el producto no fue agregado porque ya esta en la lista
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

        $scope.finalizarCompra = function () {
            window.location.href = appParameters.urlSite + 'pages/carrito.html?codigo=' + obtenerValorParametro('codigo') + '&sesion=' + obtenerValorParametro('sesion');
        };

        consultarNombreDesc = function () {
            $http.get(appParameters.urlRest + 'iteminventario/consultanombre/' + $scope.referenciaSeleccionada).then(
                function (response) {
                    if (response.data) {
                        $scope.nombreProducto = response.data.itemName;
                        $scope.descripcionProducto = response.data.uDescCorta;
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

        $scope.cambiarImagenVisible = function (valor) {
            $scope.imagenVisible += valor;
            if ($scope.imagenVisible < 0) {
                $scope.imagenVisible = $scope.listaImagenes.length - 1;
            } else if ($scope.imagenVisible >= $scope.listaImagenes.length) {
                $scope.imagenVisible = 0;
            }
        };

        $scope.procesarValorBono = function (valor) {
            $scope.mensajeErrorBono = '';
            console.log(valor);
            if ($scope.datosSesion.productos.length > 0) {
                $scope.mensajeErrorBono = 'No puedes agregar bonos y productos en la misma compra.';
                return;
            }
            if (typeof valor === 'undefined' || valor === null || valor === 0) {
                $scope.mensajeErrorBono = 'Debes ingresar un valor válido para el bono';
                return;
            }
            if (valor < $scope.lista.valorMinimoBono) {
                $scope.mensajeErrorBono = 'Debes ingresar un valor mayor al mínimo';
                return;
            }
            $scope.datosSesion.valorBono = valor;
            $scope.totalItemsEnCarrito = 1;
            $http.post(appParameters.urlRest + 'listaregalos/comprarbono/' + obtenerValorParametro('codigo'), $scope.datosSesion);
            habilitarRegalo();
        };

        habilitarRegalo = function () {
            $scope.mostrarRegalo = $scope.totalItemsEnCarrito > 0 || $scope.datosSesion.valorBono > 0;
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
                    if (response.data) {
                        $scope.referenciaSeleccionada = response.data[0].referencia;
                        $scope.lista.productos = response.data;
                        console.log(response.data);
                        for (var i = 0; i < $scope.lista.productos.length; i++) {
                            $scope.lista.productos[i].mensajeError = '';
                            consultarPrecio(i, $scope.lista.productos[i]);
                        }
                        if ($scope.datosSesion.valorBono > 0) {
                            $scope.totalItemsEnCarrito = 1;
                        } else {
                            $scope.sumarTotalItems();
                        }
                        habilitarRegalo();
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
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
            var one_day = 1000 * 60 * 60 * 24;
            //Calculate difference btw the two dates, and convert to days
            var dias = Math.ceil((fechaEvento.getTime() - today.getTime()) / (one_day));
            if (dias > 0) {
                return dias + ' días'
            } else if (dias === 0) {
                return '<b>Hoy</b>'
            } else {
                return (dias * -1) + ' días'
            }
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

        obtenerDatosSesion = function () {
            //Validar si la sesion ya fue inicializada (===null)
            if ($scope.datosSesion !== null) {
                //1 Si ya fue inicializada, invocar servicio para validar el id
                $http.get(appParameters.urlRest + 'listaregalos/sesion/' + $scope.datosSesion.idSesion).then(
                    function (response) {
                        if (response.data) {
                            if (!response.data.sesionValida) {
                                //1.1 Si el id no es validado con exito, debe crear una nueva sesion
                                crearSesion();
                            } else {
                                //1.2 Si el id es validado con exito, finaliza
                                $scope.datosSesion = response.data;
                                consultarTransaccionesPendientes();
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
                    //2.2 Si no hay un codigo de sesion en el request, debe crear una nueva sesion
                    crearSesion();
                }
            }
        };

        $scope.sesionValida = function () {
            return $scope.datosSesion !== null && typeof $scope.datosSesion.sesionValida !== 'undefined' &&
                $scope.datosSesion.sesionValida;
        };

        crearSesion = function () {
            $http.get(appParameters.urlRest + 'listaregalos/sesion/crear').then(
                function (response) {
                    if (response.data) {
                        window.location.href = appParameters.urlSite + 'pages/lista.html?codigo=' + obtenerValorParametro('codigo') + '&sesion=' + response.data.idSession;
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

        consultarTransaccionesPendientes = function () {
            $http.get(appParameters.urlRest + 'pagos/consultapendiente/' + $scope.datosSesion.idSession).then(
                function (response) {
                    if (response.data) {
                        console.log(response.data);
                        if (response.data.codigo != 0) {
                            window.location.href = appParameters.urlSite + 'pages/carrito.html?codigo=' + obtenerValorParametro('codigo') + '&sesion=' + obtenerValorParametro('sesion');
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
