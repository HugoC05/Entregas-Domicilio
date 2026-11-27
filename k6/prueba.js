import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js"
import { check, sleep } from 'k6'
import http from 'k6/http'

const baseUrl = __ENV.BASE_URL || 'http://localhost:3001/api/'
const cabeceras = { headers: { 'Content-Type': 'application/json' } }

export const options = {
    vus: 5,
    duration: '20s',
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<2000'],
    },
}

const digitos = () => String(Math.floor(Math.random() * 1e8)).padStart(8, '0')

export default function () {
    const clientes = http.get(baseUrl + 'clientes')
    check(clientes, {
        'Listar clientes status code 200': (r) => r.status == 200
    })

    const repartidores = http.get(baseUrl + 'repartidores')
    check(repartidores, {
        'Listar repartidores status code 200': (r) => r.status == 200
    })

    const pedidos = http.get(baseUrl + 'pedidos')
    check(pedidos, {
        'Listar pedidos status code 200': (r) => r.status == 200
    })

    const nuevoCliente = http.post(baseUrl + 'clientes', JSON.stringify({
        nombre: 'Cliente K6',
        correo: `k6_${__VU}_${__ITER}_${digitos()}@correo.com`,
        telefono: '55' + digitos(),
        direccion: 'Calle de Prueba 100, Col. K6',
    }), cabeceras)
    const clienteCreado = check(nuevoCliente, {
        'Crear cliente status code 201': (r) => r.status == 201
    })
    if (!clienteCreado) return
    const clienteId = nuevoCliente.json().id

    const nuevoPedido = http.post(baseUrl + 'pedidos', JSON.stringify({
        clienteId: clienteId,
        descripcion: 'Pedido de prueba K6',
    }), cabeceras)
    const pedidoCreado = check(nuevoPedido, {
        'Crear pedido status code 201': (r) => r.status == 201,
        'El pedido toma la dirección del cliente': (r) => r.json().direccionEntrega == 'Calle de Prueba 100, Col. K6',
    })

    if (pedidoCreado) {
        const pedidoId = nuevoPedido.json().id

        const detalle = http.get(baseUrl + 'pedidos/' + pedidoId)
        check(detalle, {
            'Obtener pedido status code 200': (r) => r.status == 200
        })

        const reporte = http.get(baseUrl + 'pedidos/' + pedidoId + '/reporte')
        check(reporte, {
            'Reporte PDF status code 200': (r) => r.status == 200,
            'Reporte PDF es application/pdf': (r) => String(r.headers['Content-Type']).includes('application/pdf'),
        })

        const borrarPedido = http.del(baseUrl + 'pedidos/' + pedidoId)
        check(borrarPedido, {
            'Eliminar pedido status code 204': (r) => r.status == 204
        })
    }

    const borrarCliente = http.del(baseUrl + 'clientes/' + clienteId)
    check(borrarCliente, {
        'Eliminar cliente status code 204': (r) => r.status == 204
    })

    const noExiste = http.get(baseUrl + 'clientes/999999', { responseCallback: http.expectedStatuses(404) })
    check(noExiste, {
        'Cliente inexistente status code 404': (r) => r.status == 404
    })

    sleep(1)
}

export function handleSummary(data) {
    return {
        "index.html": htmlReport(data),
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    }
}