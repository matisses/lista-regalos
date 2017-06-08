(function () {
    var app = angular.module('ListaRegalos', ['ngAnimate']);

    app.controller('ProductController', function ($scope, $http) {
        $scope.buscandoProductos = false;
        $scope.datosSesion = null;
        $scope.lista = {};
        $scope.productos = [];
        $scope.errSrc = "http://listaregalos.matisses.co/images/no-image.jpg";
        //Ejemplo estructura datos mapa filtros: {"filtro1":["1","3","6"],"filtro2":["2","1","8"],"filtro3":["3","5","7"]}
        $scope.tipoFiltro = 'dinamico';
        $scope.palabras = '';
        $scope.llavesCompletas = [];
        $scope.filtros = {};
        $scope.filtrosDisponibles = {};
        $scope.cargandoFiltros = false;
        $scope.precioMinimo;
        $scope.precioMaximo;
        $scope.mostrarTodoColeccion = false;
        $scope.mostrarTodoGrupo = false;
        $scope.mostrarTodoSubgrupo = false;
        $scope.mostrarTodoMarca = false;
        $scope.mostrarTodoColor = false;
        $scope.mostrarTodoMaterial = false;
        $scope.mostrarFiltroColeccion = false;
        //Variables para paginacion
        $scope.totalProductos = 1;
        $scope.pagina = 1;
        $scope.totalProductos = 1;
        $scope.productosPorPaginaTxt = 12;
        $scope.productosPorPagina = 12;
        $scope.orden = 'DESC';
        $scope.ordenarPor = 'NUEVO';
        $scope.ordenarPorTxt = 'Más nuevos primero';
        $scope.paginas = [];
        //Variables para modal de producto
        $scope.listaImagenes = [];
        $scope.imagenVisible = 0;
        $scope.urlImagenProductoSeleccionado = null;
        $scope.referenciaProductoSeleccionado = null;
        $scope.nombreProductoSeleccionado = null;
        $scope.descripcionProductoSeleccionado = null;
        $scope.cantidadProductoSeleccionado = null;
        $scope.cantidadElegidaProductoSeleccionado = null;
        $scope.mensajeAgradecimientoProductoSeleccionado = null;
        $scope.favoritoProductoSeleccionado = false;
        $scope.precioProductoSeleccionado = null;
        $scope.mensajeErrorAgregarProducto = '';

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

        $scope.cambiarTipoFiltro = function (tipo) {
            $scope.tipoFiltro = tipo;
            consultarValoresFiltros();
            $scope.pagina = 1;
            $scope.filtros = {};
            
            $scope.mostrarTodoColeccion = false;
            $scope.mostrarTodoGrupo = false;
            $scope.mostrarTodoSubgrupo = false;
            $scope.mostrarTodoMarca = false;
            $scope.mostrarTodoColor = false;
            $scope.mostrarTodoMaterial = false;

            obtenerLlavesFiltros();
            actualizarFiltrosDependientes();
            $scope.pagina = 1;
            consultarProductos();
        };

        $scope.consultarEstadoFiltro = function (filtro, valor) {
            if (typeof $scope.filtros[filtro] === 'undefined') {
                return 'glyphicon-unchecked';
            }
            for (var i = 0; i < $scope.filtros[filtro].length; i++) {
                if ($scope.filtros[filtro][i].valor === valor.valor) {
                    return 'glyphicon-check';
                }
            }
            return 'glyphicon-unchecked';
        };

        $scope.cambiarImagenVisible = function (valor) {
            $scope.imagenVisible += valor;
            if ($scope.imagenVisible < 0) {
                $scope.imagenVisible = $scope.listaImagenes.length - 1;
            } else if ($scope.imagenVisible >= $scope.listaImagenes.length) {
                $scope.imagenVisible = 0;
            }
        };

        $scope.alternarSeleccionFiltro = function (filtro, valor) {
            if (typeof $scope.filtros[filtro] === 'undefined' || $scope.filtros[filtro].length === 0) {
                //Agregar la categoria y el filtro
                $scope.filtros[filtro] = [valor];
            } else {
                var pos = 0;
                for (pos; pos < $scope.filtros[filtro].length; pos++) {
                    if ($scope.filtros[filtro][pos].valor === valor.valor) {
                        break;
                    }
                }
                if (pos === $scope.filtros[filtro].length) {
                    //Agregar el filtro a categoria existente
                    $scope.filtros[filtro].push(valor);
                } else {
                    //Eliminar el filtro
                    $scope.filtros[filtro].splice(pos, 1);
                    if (filtro === 'TEX') {
                        $scope.palabras = '';
                    }
                }
            }
            $scope.mostrarTodoColeccion = false;
            $scope.mostrarTodoGrupo = false;
            $scope.mostrarTodoSubgrupo = false;
            $scope.mostrarTodoMarca = false;
            $scope.mostrarTodoColor = false;
            $scope.mostrarTodoMaterial = false;

            obtenerLlavesFiltros();
            actualizarFiltrosDependientes();
            $scope.pagina = 1;
            consultarProductos();
        }

        $scope.alternarEstadoFavorito = function () {
            $scope.favoritoProductoSeleccionado = !$scope.favoritoProductoSeleccionado;
        };

        $scope.cambiarProductosPorPagina = function (valor) {
            $scope.productosPorPagina = valor;
            $scope.productosPorPaginaTxt = valor;
            $scope.pagina = 1;
            consultarProductos();
        };

        $scope.cambiarOrdenamiento = function (valorTxt, valor, orden) {
            $scope.ordenarPorTxt = valorTxt;
            $scope.ordenarPor = valor;
            $scope.orden = orden;
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

        $scope.seleccionarProducto = function (producto) {
            $scope.imagenVisible = 0;
            $scope.listaImagenes = [];
            $scope.referenciaProductoSeleccionado = producto.itemCode;
            $scope.favoritoProductoSeleccionado = false;
            $scope.nombreProductoSeleccionado = producto.itemName;
            $scope.descripcionProductoSeleccionado = producto.shortDescription;
            $scope.cantidadElegidaProductoSeleccionado = null;
            $scope.mensajeAgradecimientoProductoSeleccionado = null;
            $scope.cantidadProductoSeleccionado = producto.availableQuantity;
            $scope.precioProductoSeleccionado = producto.priceAsInt;
            $scope.mensajeErrorAgregarProducto = '';
            definirImagenProducto($scope.referenciaProductoSeleccionado);
            consultarImagenesProducto();
            $('#modalProducto').modal('show');
        };

        $scope.agregarProducto = function () {
            //TODO: validar datos
            if ($scope.cantidadElegidaProductoSeleccionado === null || $scope.cantidadElegidaProductoSeleccionado <= 0) {
                $scope.mensajeErrorAgregarProducto = 'Debes indicar la cantidad que deseas del producto';
                return;
            }
            var datosProducto = {
                idLista: $scope.lista.idLista,
                referencia: $scope.referenciaProductoSeleccionado,
                descripcionProducto: $scope.nombreProductoSeleccionado,
                favorito: $scope.favoritoProductoSeleccionado,
                cantidadElegida: $scope.cantidadElegidaProductoSeleccionado,
                mensajeAgradecimiento: $scope.mensajeAgradecimientoProductoSeleccionado
            };
            $http.post(appParameters.urlRest + 'listaregalos/agregarproducto', datosProducto).then(
                function (response) {
                    if (response.data) {
                        if (response.data.codigo === 0) {
                            $scope.referenciaProductoSeleccionado = null;
                            $scope.favoritoProductoSeleccionado = false;
                            $scope.nombreProductoSeleccionado = null;
                            $scope.descripcionProductoSeleccionado = null;
                            $scope.cantidadElegidaProductoSeleccionado = null;
                            $scope.cantidadProductoSeleccionado = null;
                            $scope.precioProductoSeleccionado = null;
                            $scope.mensajeAgradecimientoProductoSeleccionado = null;
                            $scope.mensajeErrorAgregarProducto = '';
                            $('#modalProducto').modal('hide');
                            consultarLista('compra');
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

        $scope.eliminarProducto = function (referencia) {
            var datosProducto = {
                idLista: $scope.lista.idLista,
                referencia: referencia,
                cantidadElegida: 0
            };
            $http.post(appParameters.urlRest + 'listaregalos/modificarproducto', datosProducto).then(
                function (response) {
                    if (response.data) {
                        if (response.data.codigo === 0) {
                            consultarLista('compra');
                        } else {
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

        $scope.volverAEditar = function () {
            window.location.href = appParameters.urlSite + 'pages/editar_lista.html?sesion=' +
                $scope.datosSesion.idSession + '&codigo=' + obtenerValorParametro('codigo');
        };

        $scope.procesarBusqueda = function (event) {
            if (event.which == 13) {
                $scope.buscarPorTexto();
            }
        };

        $scope.buscarPorTexto = function () {
            $scope.filtros['TEX'] = [];
            var palabras = $scope.palabras.split(' ');
            for (var i = 0; i < palabras.length; i++) {
                $scope.filtros['TEX'].push({
                    valor: palabras[i]
                });
            }
            $scope.pagina = 1;
            obtenerLlavesFiltros();
            consultarProductos();
        };

        $scope.filtrarPorPrecio = function () {
            if ($scope.precioMinimo < 0) {
                return;
            }
            $scope.filtros['PRE'] = [{
                valor: $scope.precioMinimo
            }, {
                valor: $scope.precioMaximo
            }];
            $scope.pagina = 1;
            consultarProductos();
        };

        $scope.alternarMostrarTodo = function (variable) {
            if (variable === 'grupo') {
                $scope.mostrarTodoGrupo = !$scope.mostrarTodoGrupo;
            }
            if (variable === 'subgrupo') {
                $scope.mostrarTodoSubgrupo = !$scope.mostrarTodoSubgrupo;
            }
            if (variable === 'marca') {
                $scope.mostrarTodoMarca = !$scope.mostrarTodoMarca;
            }
            if (variable === 'color') {
                $scope.mostrarTodoColor = !$scope.mostrarTodoColor;
            }
            if (variable === 'material') {
                $scope.mostrarTodoMaterial = !$scope.mostrarTodoMaterial;
            }
            if (variable === 'coleccion') {
                $scope.mostrarTodoColeccion = !$scope.mostrarTodoColeccion;
            }
        };

        obtenerLlavesFiltros = function () {
            var llaves = $.map($scope.filtros, function (v, i) {
                return i;
            });
            $scope.llavesCompletas = [];
            for (var i = 0; i < llaves.length; i++) {
                var llaveFiltro = {
                    cod: llaves[i],
                    desc: null
                };
                if (llaves[i] === 'DEP') {
                    llaveFiltro.desc = 'Departamento';
                } else if (llaves[i] === 'GRU') {
                    llaveFiltro.desc = 'Grupo';
                } else if (llaves[i] === 'SUB') {
                    llaveFiltro.desc = 'Subgrupo';
                } else if (llaves[i] === 'MAT') {
                    llaveFiltro.desc = 'Material';
                } else if (llaves[i] === 'COL') {
                    llaveFiltro.desc = 'Color';
                } else if (llaves[i] === 'PRE') {
                    llaveFiltro.desc = 'Precio';
                } else if (llaves[i] === 'MAR') {
                    llaveFiltro.desc = 'Marca';
                } else if (llaves[i] === 'CLC') {
                    llaveFiltro.desc = 'Colección';
                } else if (llaves[i] === 'TEX') {
                    llaveFiltro.desc = 'Texto';
                }
                $scope.llavesCompletas.push(llaveFiltro);
            }
            return $scope.llavesCompletas;
        };

        mostrarFiltroColeccion = function () {
            $scope.mostrarFiltroColeccion = false;
            if (typeof $scope.filtros['GRU'] === 'undefined' || $scope.filtros['GRU'].length === 0) {
                return;
            }
            for (var i = 0; i < $scope.filtros['GRU'].length; i++) {
                for (var j = 0; j < $scope.filtros['GRU'][i].infoAdicional.length; j++) {
                    if ($scope.filtros['GRU'][i].infoAdicional[j] === '024' /*Vajillas*/ ||
                        $scope.filtros['GRU'][i].infoAdicional[j] === '037' /*Velas y fragancias*/ ) {
                        $scope.mostrarFiltroColeccion = true;
                    }
                }
            }
            console.log('mostrar coleccion: ' + $scope.mostrarFiltroColeccion);
        }

        actualizarFiltrosDependientes = function () {
            if ($scope.tipoFiltro === 'estatico') {
                return;
            }
            $scope.cargandoFiltros = true;
            $http.post(appParameters.urlRest + 'filtros/obtenerconfiltro', $scope.filtros).then(
                function (response) {
                    if (response.data) {
                        $scope.filtrosDisponibles = response.data;
                        $scope.cargandoFiltros = false;
                        mostrarFiltroColeccion();
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    $scope.cargandoFiltros = false;
                    console.error(response);
                    mostrarFiltroColeccion();
                }
            );
        };

        consultarImagenesProducto = function () {
            $scope.imagenVisible = 0;
            $http.get(appParameters.urlRest + 'imagenes/listar/' + $scope.referenciaProductoSeleccionado).then(
                function (response) {
                    if (response.data) {
                        console.log(response.data);
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

        obtenerDatosSesion = function () {
            //Validar si la sesion ya fue inicializada (===null)
            if ($scope.datosSesion !== null) {
                //1 Si ya fue inicializada, invocar servicio para validar el id
                $http.get(appParameters.urlRest + 'listaregalos/sesion/' + $scope.datosSesion.idSession).then(
                    function (response) {
                        if (response.data) {
                            //if (!response.data.sesionValida) {
                            //1.1 Si el id no es validado con exito, debe redirigir a pagina de inicio
                            //window.location.href = appParameters.urlSite;
                            //} else {
                            //1.2 Si el id es validado con exito, finaliza
                            $scope.datosSesion = response.data;
                            consultarLista('inicio');
                            consultarValoresFiltros();
                            console.log($scope.datosSesion);
                            //}
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

        consultarValoresFiltros = function () {
            $http.get(appParameters.urlRest + 'filtros/listar').then(
                function (response) {
                    if (response.data) {
                        $scope.filtrosDisponibles = response.data;
                        console.log($scope.filtrosDisponibles);
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    console.error(response);
                }
            );
        };

        consultarLista = function (origen) {
            var consulta = {
                codigo: obtenerValorParametro('codigo')
            };
            $http.post(appParameters.urlRest + 'listaregalos/consultarlista/', consulta).then(
                function (response) {
                    if (response.data) {
                        if (response.data.codigo === 0) {
                            $scope.lista = response.data.lista;
                            //Consultar productos lista

                            if (origen === 'inicio') {
                                consultarProductos();
                            } else {
                                consultarProductosLista();
                            }
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

        consultarProductosLista = function () {
            $http.post(appParameters.urlRest + 'listaregalos/consultarproductos/sinpaginar', $scope.lista.idLista).then(
                function (response) {
                    if (response.data) {
                        //Consultar productos lista
                        console.log(response.data);
                        $scope.lista.productos = response.data;
                        identificarProductosSeleccionados();
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

        identificarProductosSeleccionados = function () {
            for (var i = 0; i < $scope.productos.length; i++) {
                for (var j = 0; j < $scope.lista.productos.length; j++) {
                    if ($scope.productos[i].itemCode === $scope.lista.productos[j].referencia) {
                        $scope.productos[i].seleccionado = true;
                        break;
                    } else {
                        $scope.productos[i].seleccionado = false;
                    }
                }
            }
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
                for (var i = $scope.pagina - Math.floor(paginasMostradas / 2); i <= $scope.pagina + Math.floor(paginasMostradas / 2); i++) {
                    $scope.paginas.push(i);
                }
            }
        };

        consultarProductos = function () {
            $scope.buscandoProductos = true;
            $scope.productos = [];
            var consulta = {
                pagina: $scope.pagina,
                registrosPagina: $scope.productosPorPagina,
                filtros: $scope.filtros,
                sortOrder: $scope.orden,
                orderBy: $scope.ordenarPor,
                conSaldo: true
            };
            $http.post(appParameters.urlRest + 'consultaproductos/filtrar/', consulta).then(
                function (response) {
                    $scope.buscandoProductos = false;
                    if (response.data && response.data.totalProductos > 0) {
                        $scope.totalProductos = response.data.totalProductos;
                        console.log(response.data);
                        $scope.productos = response.data.productos;
                        //validar si el producto esta en la lista
                        for (var i = 0; i < $scope.productos.length; i++) {
                            validarImagenProducto(i);
                        }
                        consultarProductosLista();
                        calcularPaginas();
                        $scope.mostrarInformacion = true;
                    } else {
                        //TODO: mostrar mensaje de error
                        console.error(response);
                        return;
                    }
                },
                function (response) {
                    //TODO: mostrar mensaje de error
                    $scope.buscandoProductos = false;
                    console.error(response);
                    return;
                }
            );
        };

        validarImagenProducto = function (pos) {
            $scope.productos[pos].urlImagen = "https://www.matisses.co/modules/wsmatisses/files/" +
                $scope.productos[pos].itemCode + "/images/" + $scope.productos[pos].itemCode + "_01.jpg";
            $http.get($scope.productos[pos].urlImagen).then(
                function (response) {
                    //do nothing
                },
                function (response) {
                    $scope.productos[pos].urlImagen = $scope.errSrc;
                }
            );
        };

        definirImagenProducto = function (ref) {
            $scope.urlImagenProductoSeleccionado = "https://www.matisses.co/modules/wsmatisses/files/" + ref + "/images/" + ref + "_01.jpg";
            $http.get($scope.urlImagenProductoSeleccionado).then(
                function (response) {
                    //do nothing
                },
                function (response) {
                    $scope.urlImagenProductoSeleccionado = $scope.errSrc;
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
