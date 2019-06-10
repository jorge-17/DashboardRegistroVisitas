(function(yourcode) {
    // The global jQuery object is passed as a parameter
    yourcode(window.jQuery, window, document);
}(function($, window, document) {
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

    async function cargaTablaVisitasActivas() {
        $("#menuVistasActivas").empty();
        var resultado;
        try {
            resultado = await $.ajax({
                type: "GET",
                url: "https://web-visitas.ciatec.int/ws/api/rVisitas/consultaVisitasActivas"
            });
        } catch (error) {
            console.log(error);
        }

        $.when(resultado).done(function (data) {
            var datos = data;
            var cont = 0;
            datos.forEach(element => {
                var menuVA = $("#menuVistasActivas");
                var itemVA = $("<li></li>");
                var infoVA = $("<a></a>");
                var spanEnca = $("<span></span>");
                var spanNombre = $("<span>" + element["nombreVisitante"] + "</span>");
                var fechasFormat = element['fechaEntrada'].split("T");
                var spanTiempo = $("<span class='time'>" + fechasFormat[0] + " " + fechasFormat[1] + "</span>");
                spanEnca.append(spanNombre, spanTiempo);
                var spanEmpresa = $("<span class='message'>Empresa: " + element["empresa"] + "<br>" +
                "Asunto: " + element["asunto"] +"</span>")
                infoVA.append(spanEnca, spanEmpresa);
                itemVA.append(infoVA);
                menuVA.append(itemVA);
            });
        })

    }

    $(window).on("load", function(){
        cargaNoVisitasActivas();
        cargaTablaVisitasActivas();
    });

    setInterval(function(){
        cargaNoVisitasActivas();
        cargaTablaVisitasActivas();
    }, 10000);
}));