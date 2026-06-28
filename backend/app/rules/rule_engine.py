class RuleEngine:

    @staticmethod
    def evaluate(data):

        errores = []

        # RF-8
        if not data.documentos_completos:
            errores.append(
                "El expediente documental está incompleto."
            )

        # RF-12 y RF-13
        if data.ingresos_cliente < (data.valor_canon * 2):
            errores.append(
                "Los ingresos del cliente no cumplen la política financiera."
            )

        # RF-21
        if data.observaciones_contrato:
            errores.append(
                "Existen observaciones contractuales pendientes."
            )

        # RF-23
        if not data.firma_completada:
            errores.append(
                "La firma del contrato aún no se ha completado."
            )

        # RF-29
        if not data.acta_entrega:
            errores.append(
                "No existe un acta de entrega registrada."
            )

        return {
            "resultado": "APROBADO" if not errores else "RECHAZADO",
            "motivos": errores
        }