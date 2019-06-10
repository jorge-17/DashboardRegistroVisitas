(function (a) {
    a(window.jQuery, window, document);
}(function ($, window, document) {
    var table3;
    const fechaNow = new Date();
    const yearN = fechaNow.getFullYear();
    const monthN = fechaNow.getMonth();
    const dayN = fechaNow.getDate();
    $("#dateRangePicker1").daterangepicker({
        "maxDate": (monthN + 1) + "/" + dayN + "/" + yearN,
        "format": "DD/MM/YYYY",            
        "autoUpdateInput": false,
        "locale": {            
            "applyLabel": "Aplicar",
            "cancelLabel": "Cancelar",
            "fromLabel": "De",
            "toLabel": "A",
            "daysOfWeek": [
                "Dom.",
                "Lun.",
                "Mar.",
                "Mie.",
                "Jue.",
                "Vie.",
                "Sab."
            ],
            "monthNames": [
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agusto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre"
            ],
        }
    });
    async function cargaTablaReporteVisitas() {
        const fechaRep2 = $("#dateRangePicker1").val();
        var dateRangeNow = new Date();
        if (fechaRep2 !== "") {
            var dateRange = fechaRep2.split(" - ");
            var dRinit = dateRange[0].split("/");
            var dateInicial = dRinit[2]+ "/" +dRinit[1]+ "/" +dRinit[0];
            var dRend = dateRange[1].split("/");
            var dateFinal = dRend[2]+ "/" +dRend[1]+ "/" + (parseInt(dRend[0])) + " " + dateRangeNow.getHours() + ":" + dateRangeNow.getMinutes();
        } else {            
            var dateInicial = dateRangeNow.getFullYear() + "/" + (dateRangeNow.getMonth() + 1) + "/" + dateRangeNow.getDate();
            var dateFinal = dateRangeNow.getFullYear() + "/" + (dateRangeNow.getMonth() + 1) + "/" + (dateRangeNow.getDate()) + " " + dateRangeNow.getHours() + ":" + dateRangeNow.getMinutes();
        }
        var dataJson = JSON.stringify({
            fechaIni: dateInicial,
            fechaEnd: dateFinal
        });
        var resultadoNoVisitas;
        try {
            resultadoNoVisitas = await $.ajax({
                type: "POST",
                url: "https://web-visitas.ciatec.int/ws/api/rVisitas/NoVisitantes",
                data: dataJson,
                contentType: "application/json; charset=utf-8"
            })
        } catch (e) {
            console.log(e.message);
        }
        $.when(resultadoNoVisitas).done(function (data) {
            $("#num_visitas").html(data);
        });


        var resultado;
        try {
            resultado = await $.ajax({
                type: "POST",
                url: "https://web-visitas.ciatec.int/ws/api/rVisitas/fechas",
                data: dataJson,
                contentType: "application/json; charset=utf-8"
            });
        } catch (error) {
            console.log(error);
        }

        $.when(resultado).done(function (data) {
            $("#tablaReportes1 thead").show();
            var pFisicias = data;
            var cont = 0;
            pFisicias.forEach(element => {
                var fila = $("<tr></tr>").attr("id", "tblReporVisitas" + cont);
                $("#TblRepBody").append(fila);
                fila.append("<td>" + element['visi_Nombre'] + "</td>");
                fila.append("<td>" + element['visi_Empresa'] + "</td>");
                fila.append("<td>" + element['tip_Descripcion']+ "</td>")
                fila.append("<td>" + element['emp_Nombre'] + "</td>");
                fila.append("<td>" + element['vis_Asunto'] + "</td>");
                var fechasFormat = element['vis_FechaEntrada'].split("T");
                fila.append("<td>" + fechasFormat[0] + " " + fechasFormat[1] + "</td>");
                fila.append("<td>" + element['emp_Direccion'] + "</td>");
                fila.append("<td>" + element['emp_Area'] + "</td>");
                var calif = element['vis_Calificacion'] == null ? "" : element['vis_Calificacion'];
                fila.append("<td><center>" + calif + "</center></td>");
                fila.append("<td>" + element['vis_Observacion']+ "</td>");
            });
            table3 = $("#tablaReportes1").DataTable({
                dom: 'Bfrtlip',
                buttons: [
                    {
                        extend: 'excelHtml5',
                        title: 'Reporte Visitas'
                    }
                ],
                language: {
                    lengthMenu: "Mostrar _MENU_ visitas por pagina",
                    zeroRecords: "No se encontraros visitas",
                    info: "Mostrando pagina _PAGE_ de _PAGES_",
                    infoEmpty: "No se encontraros visitas",
                    infoFiltered: "(filtradas de _MAX_ total de visitas)",
                    paginate: {
                        first:      "Primero",
                        last:       "Último",
                        next:       "Siguiente",
                        previous:   "Anterior"
                    },
                    search:         "Buscar:",
                }
            });
        })
    }

    $('#dateRangePicker1').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
        if ($.fn.dataTable.isDataTable('#tablaReportes1')) {
            table3.destroy();
            $("#TblRepBody").empty();
        }
        cargaTablaReporteVisitas();
    });

    $(window).on("load", function () {
        cargaTablaReporteVisitas();
    });
}));