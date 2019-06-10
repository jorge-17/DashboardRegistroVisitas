(function (a) {
    a(window.jQuery, window, document);
}(function ($, window, document) {

    var idVisita;

    async function cargaTablaVisitasEspera() {
        var resultado;
        try {
            resultado = await $.ajax({
                type: "GET",
                url: "https://web-visitas.ciatec.int/ws/api/rVisitas/consultaVisitasEspera"
            });
        } catch (error) {
            console.log(error);
        }

        $.when(resultado).done(function (data) {
            var datos = data;
            var cont = 0;
            datos.forEach(element => {
                var fila = $("<tr></tr>").attr("id", "tblModAte" + cont);
                $("#tbodyModAtencion").append(fila);
                fila.append("<td style='display:none'>" + element['idVisita'] + "</td>")
                fila.append("<td>" + element['nombreVisitante'] + "</td>");
                fila.append("<td>" + element['empresa'] + "</td>");
                fila.append("<td>" + element['asunto'] + "</td>");
                fila.append("<td>" + element['colaborador'] + "</td>");
                var fechasFormat = element['fechaEntrada'].split("T");
                fila.append("<td>" + fechasFormat[0] + " " + fechasFormat[1] + "</td>");
                fila.append("<td>" + element['tipoVisitante'] + "</td>");
                fila.append("<td><button id='btnAtendido' type='button' class='btn btn-success'>Atendido</button></td>");
            });
        })

    }

   

    function cargaNoVisitasActivas() {
        var noVisitasActivas;
        
        var resultado;

        try {
            resultado = $.ajax({
                type: "GET",
                url: "https://web-visitas.ciatec.int/ws/api/rVisitas/NoVisitantesActivos"
            })
        } catch (e) {
            console.log(e.message);
        }
        $.when(resultado).done(function (data) {
            $("#num_visitasA").html(data);
        });
    }


    async function actualizaVisita(idVisita) {
        var fechaNow = new Date();
        var strFechaNow = fechaNow.getFullYear() + "-" + (fechaNow.getMonth() + 1) + "-" + fechaNow.getDate() +
            " " + fechaNow.getHours() + ":" + fechaNow.getMinutes() + ":" + fechaNow.getSeconds();
        var dataJson = JSON.stringify({
            id: idVisita,
            fecha: strFechaNow
        });
        var resultado;
        try {
            resultado = $.ajax({
                type: "POST",
                url: "https://web-visitas.ciatec.int/ws/api/rVisitas/rVisitaRecepcion",
                data: dataJson,
                contentType: "application/json; charset=utf-8"
            });
        } catch (e) {
            console.log(e.message)
        }
        $.when(resultado).done(function (data) {
            var datos = data;            
            cargaTablaVisitasEspera();
            cargaNoVisitasActivas();
            PNotify.success({
                title: 'Exito',
                text: 'Se ha atendido la visita.',
                styling: 'bootstrap4',
                delay: 2000
            });
        });
    }



    $(window).on("load", function () {

        cargaTablaVisitasEspera();

        cargaNoVisitasActivas();


    })


    $("#tbodyModAtencion").on("click", "tr .btn-success", function (ev) {
        var parent = $(this).parent("td").parent("tr");
        var child = parent.children("td");
        idVisita = child[0].innerText;

        actualizaVisita(idVisita);
    });

    setInterval(async function () {
        $("#tbodyModAtencion").empty();
        cargaTablaVisitasEspera();
        cargaNoVisitasActivas();
    }, 10000);

}));
