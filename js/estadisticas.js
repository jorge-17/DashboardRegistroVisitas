(function (a) {
    a(window.jQuery, window, document);
}(function ($, window, document) {
    var dataGraph3 = [];
    var calificaciones = [];

    var fechaNow = new Date();
    const yearN = fechaNow.getFullYear();
    const monthN = fechaNow.getMonth();
    const dayN = fechaNow.getDate();
    var mesNow = (fechaNow.getMonth() + 1);

    $("#dateRangePicker1").datetimepicker({
        "viewMode": "months",
        "format": 'MM/YYYY',
        "locale": "es"
    });

    function compare( a, b ) {
        if ( a.name < b.name ){
          return -1;
        }
        if ( a.name > b.name ){
          return 1;
        }
        return 0;
      }


    async function cargaG_Calificacion() {
        var resultado;
        var uri;
        var dataJson;
        var caliNum = 1;
        var calif = [
            {name:'Una estrella', val:1},
            {name:'Dos estrellas', val:2},
            {name:'Tres estrellas', val:3},
            {name:'Cuatro estrellas', val:4},
            {name:'Cinco estrellas', val:5}
        ];
        const fechaRep2 = $("#dateRangePicker1 input").val();
        calif.forEach(async element => {            
            if (fechaRep2 !== "") {
                var dateRange = fechaRep2.split("/");
                var dRMes = dateRange[0];
                var dRAño = dateRange[1];
                uri = "https://web-visitas.ciatec.int/ws/api/rVisitas/vCalificacionMesAnio";
                dataJson = JSON.stringify({
                    calificacion: element.val,
                    mes: dRMes,
                    anio: dRAño
                })
            } else {
                uri = "https://web-visitas.ciatec.int/ws/api/rVisitas/vCalificacionMes";
                dataJson = JSON.stringify({
                    "calificacion": element.val,
                    "mes": mesNow
                })
            }
            try {
                resultado = await $.ajax({
                    type: "POST",
                    url: uri,
                    data: dataJson,
                    contentType: "application/json",
                    dataType: "json"
                })
            } catch (e) {
                console.log(e.message);
            }
            $.when(resultado).done(function (data) {
                calificaciones.push({name: element.val, y: data});
                //Ordenar datos cargados al arreglo con los valores de las peticiones
                calificaciones.sort(compare) ;           
            });
            caliNum++;
        });


        setTimeout(function(){
            Highcharts.chart('gra_xCalif', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'No. de visitas por calificaciones'
                },
                xAxis: {
                    categories: [
                        'Una estrella',
                        'Dos estrellas',
                        'Tres estrellas',
                        'Cuatro estrellas',
                        'Cinco estrellas'
                    ],
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'No. de Visitas'
                    },
                    allowDecimals: false
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                exporting: {
                    enabled: false
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'No. de Visitas',
                    data: calificaciones
                }]
            });
        }, 1000);

        calificaciones = [];
    }

    async function cargaG_Area() {
        var direccionValue = $("#direccionesSele").val();
        var dataJsonAreas = JSON.stringify({
            direccion: direccionValue
        });
        var areasName = [];
        var noVistasArea = [];
        var resultado;
        var dataGraph = [];

        try {
            resultado = await $.ajax({
                type: "POST",
                url: "https://web-visitas.ciatec.int/ws/api/rVisitas/AreasxDireccion",
                data: dataJsonAreas,
                contentType: "application/json",
                dataType: "json"
            })
        } catch (e) {
            console.log(e.message);
        }
        $.when(resultado).done(function (data) {
            noVistasArea = data;
            noVistasArea.forEach(element => {
                areasName.push(element);
            });
        });

        areasName.forEach(element => {            
            var uriNumArea;
            const fechaRep2 = $("#dateRangePicker1 input").val();
            if (fechaRep2 !== "") {
                var dateRange = fechaRep2.split("/");
                var dRMes = dateRange[0];
                var dRAño = dateRange[1];
                uriNumArea = "https://web-visitas.ciatec.int/ws/api/rVisitas/NoVisitantesAMesAnio";
                var dataJsonNoVisitas = JSON.stringify({
                    area1: element,
                    area2: "",
                    mes: dRMes,
                    anio: dRAño
                });
            } else {
                uriNumArea = "https://web-visitas.ciatec.int/ws/api/rVisitas/NoVisitantesAMes";
                var dataJsonNoVisitas = JSON.stringify({
                    area1: element,
                    area2: "",
                    mes: mesNow
                });
            }
            try {
                resultado = $.ajax({
                    type: "POST",
                    url: uriNumArea,
                    data: dataJsonNoVisitas,
                    contentType: "application/json",
                    dataType: "json"
                })
            } catch (e) {
                console.log(e.message);
            }
            $.when(resultado).done(function (data) {
                dataGraph.push({ name: element, y: data });
            });

        });

        setTimeout(function () {
            Highcharts.chart('gra_xArea', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Visitas por Área'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y}</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                exporting: {
                    enabled: false
                },
                series: [{
                    name: 'No. de visitas',
                    colorByPoint: true,
                    data: dataGraph
                }]
            });
        }, 500);


    }

    async function cargaG_Direccion() {

        var direcciones = [
            "Dirección Académica",
            "Dirección Administrativa",
            "Dirección de P. T. S. Dinámicos",
            "Dirección de P. T. S. Maduros",
            "Dirección de Servicios Tecnologicos",
            "Dirección de Soluciones Tecnológicas",
            "Dirección General",
            "Organo Interno de Control"
        ];

        direcciones.forEach(async element => {
            var uriNumVDireccion;
            const fechaRep2 = $("#dateRangePicker1 input").val();
            if (fechaRep2 !== "") {
                var dateRange = fechaRep2.split("/");
                var dRMes = dateRange[0];
                var dRAño = dateRange[1];
                uriNumVDireccion = "https://web-visitas.ciatec.int/ws/api/rVisitas/NoVisitantesDMesAnio";
                var dataJsonNoVisitas = JSON.stringify({
                    direccion1: element,
                    direccion2: "",
                    mes: dRMes,
                    anio: dRAño
                });
            } else {
                uriNumVDireccion = "https://web-visitas.ciatec.int/ws/api/rVisitas/NoVisitantesDMes";
                var dataJsonNoVisitas = JSON.stringify({
                    direccion1: element,
                    direccion2: "",
                    mes: mesNow
                });
            }
            try {
                resultado = await $.ajax({
                    type: "POST",
                    url: uriNumVDireccion,
                    data: dataJsonNoVisitas,
                    contentType: "application/json",
                    dataType: "json"
                })
            } catch (e) {
                console.log(e.message);
            }
            $.when(resultado).done(function (data) {
                dataGraph3.push({ name: element, y: data });
            });


        });

        setTimeout(function () {
            Highcharts.chart('gra_xDir', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Visitas por Dirección'
                },
                xAxis: {
                    categories: direcciones,
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'No de visitas'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                exporting: {
                    enabled: false
                },
                series: [{
                    name: 'No. de visitas',
                    data: dataGraph3
                }]
            });
        }, 1000);

        dataGraph3 = [];

    }

    function cargaMosaicosInit() {
        var uriPromG;
        var uriNumV;
        const fechaRep2 = $("#dateRangePicker1 input").val();
        if (fechaRep2 !== "") {
            var dateRange = fechaRep2.split("/");
            var dRMes = dateRange[0];
            var dRAño = dateRange[1];
            uriNumV = "https://web-visitas.ciatec.int/ws/api/rVisitas/noVisitasxMesAnio";
            uriPromG = "https://web-visitas.ciatec.int/ws/api/rVisitas/pGeneralMesAnio";
            var dataJson = JSON.stringify({
                mes: dRMes,
                anio: dRAño
            });
        } else {
            uriPromG = "https://web-visitas.ciatec.int/ws/api/rVisitas/pGeneralMes";
            uriNumV = "https://web-visitas.ciatec.int/ws/api/rVisitas/noVisitasxMes";
            var dataJson = JSON.stringify({
                mes: mesNow
            });
        }

        var resultado;
        try {
            resultado = $.ajax({
                type: "POST",
                url: uriPromG,
                data: dataJson,
                contentType: "application/json; charset=utf-8"
            })
        } catch (e) {
            console.log(e.message);
        }
        $.when(resultado).done(function (data) {
            $("#prom_GeneralV").html(data);
        });

        var resultadoNoVisitas;
        try {
            resultadoNoVisitas = $.ajax({
                type: "POST",
                url: uriNumV,
                data: dataJson,
                contentType: "application/json; charset=utf-8"
            })
        } catch (e) {
            console.log(e.message);
        }
        $.when(resultadoNoVisitas).done(function (data) {
            $("#num_visitasT").html(data);
        });
    }

    $(window).on("load", function () {
        cargaG_Direccion();
        cargaG_Calificacion();
        cargaMosaicosInit();
    })

    $("#graficaxAreas").on("change", "#direccionesSele", function () {
        cargaG_Area();
    })

    $('#dateRangePicker1').on('focusout', function (ev, picker) {
        //$(this).val(picker.startDate.format('MM/YYYY'));
        cargaMosaicosInit();
        cargaG_Direccion();
        cargaG_Calificacion();
        cargaG_Area();
    });
}));