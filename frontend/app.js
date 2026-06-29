async function evaluar() {

    const payload = {
        proceso_id: document.getElementById("proceso_id").value,
        tipo_operacion: document.getElementById("tipo_operacion").value,
        ingresos_cliente: parseFloat(
            document.getElementById("ingresos_cliente").value
        ),
        valor_canon: parseFloat(
            document.getElementById("valor_canon").value
        ),
        documentos_completos:
            document.getElementById("documentos_completos").checked,

        observaciones_contrato:
            document.getElementById("observaciones_contrato").checked,

        firma_completada:
            document.getElementById("firma_completada").checked,

        acta_entrega:
            document.getElementById("acta_entrega").checked
    };

    const response = await fetch(
        "http://127.0.0.1:8000/evaluate",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

    const data = await response.json();

    document.getElementById("resultado").innerHTML =
        `
        <h2>${data.resultado}</h2>
        <p>${data.motivos.join("<br>")}</p>
        `;
}

async function crearCliente() {

    const payload = {
        nombres: document.getElementById("nombres").value,
        apellidos: document.getElementById("apellidos").value,
        documento_identidad: document.getElementById("documento").value,
        telefono: document.getElementById("telefono").value,
        correo: document.getElementById("correo").value,
        ingresos_mensuales: parseFloat(
            document.getElementById("ingresos").value
        )
    };

    const response = await fetch(
        "http://127.0.0.1:8000/clientes",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

    const data = await response.json();

    alert(
        `Cliente creado correctamente.\nID: ${data.id_cliente}`
    );
}