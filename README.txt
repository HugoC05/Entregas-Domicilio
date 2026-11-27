# Proyecto Entregas a Domicilio

API para gestionar **clientes**, **repartidores** y **pedidos** de entregas a domicilio. Está hecha con Node.js, Express y MongoDB (Mongoose), y se puede ejecutar con Docker.

## Cómo ejecutarlo

### 1. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (junto a `package.json`):

```
MONGODB_URI=mongodb+srv://USUARIO:CONTRASEÑA@cluster0.xxxxx.mongodb.net/entregas_domicilio?retryWrites=true&w=majority
PORT=3001
```

La base de datos está en MongoDB Atlas. Las colecciones (`clientes`, `repartidores`, `pedidos` y `contadores`) se crean solas al guardar el primer dato.

### 2. Con Docker

```
docker compose up --build
```

La API queda disponible en http://localhost:3001

Para apagarla: `Ctrl + C` o `docker compose down`.

### 3. Sin Docker

```
npm install
npm start
```

## Organización del proyecto

```
src/
  baseDeDatos/     conexión a MongoDB y modelos de Mongoose (entidades)
  controladores/   reciben la petición HTTP y devuelven la respuesta
  dtos/            validan los datos de entrada y dan forma a los de salida
  servicios/       reglas de negocio (Business Layer)
  errores/         errores propios y manejador central de errores
  rutas/index.js   rutas de la API y arranque del servidor
Dockerfile
docker-compose.yml
.dockerignore
package.json
```

### Cómo viaja una petición

```
Postman → rutas → controlador → DTO (valida) → servicio (reglas) → modelo → MongoDB
```

- **Rutas:** indican qué URL y método llaman a qué controlador.
- **Controlador:** recibe la petición, usa el DTO, llama al servicio y responde con el código HTTP correcto.
- **DTO (Data Transfer Object):** objeto para transferir datos entre el usuario y el sistema. Valida y limpia lo que llega, y define lo que se devuelve.
- **Servicio (Business Layer):** aplica las reglas de negocio y verifica que los registros existan.
- **Modelo (Entidad):** objeto que representa una colección de la base de datos.

## Reglas de negocio

**Clientes**
- El correo y el teléfono no se pueden repetir. El correo se guarda en minúsculas.
- El teléfono debe tener exactamente 10 dígitos.
- Cada cliente tiene una sola dirección.
- No se puede eliminar un cliente que tenga pedidos.

**Repartidores**
- El correo no se puede repetir.
- Tienen un estado de disponibilidad (`disponible`), que por defecto es `true`.
- No se puede eliminar un repartidor que tenga pedidos asignados.

**Pedidos**
- Solo se crean si el cliente existe.
- No se manda la dirección de entrega: se toma automáticamente de la dirección del cliente.
- Nacen con estado `PENDIENTE`.
- Los estados avanzan así: `PENDIENTE → EN_CAMINO → ENTREGADO`. También pueden pasar a `CANCELADO` desde `PENDIENTE` o `EN_CAMINO`.
- Para pasar a `EN_CAMINO` necesitan un repartidor asignado y disponible. Al salir, el repartidor queda ocupado, y se libera cuando el pedido pasa a `ENTREGADO` o `CANCELADO`.
- No se puede cambiar el repartidor de un pedido que va `EN_CAMINO`.
- Un pedido `ENTREGADO` o `CANCELADO` ya no se puede modificar.
- Solo se pueden eliminar pedidos `PENDIENTE` o `CANCELADO`.

**General**
- Los `id` son numéricos y consecutivos (1, 2, 3...).

## Rutas de la API

| Recurso | Rutas |
|---|---|
| Clientes | `GET` y `POST` en `/api/clientes`; `GET`, `PUT` y `DELETE` en `/api/clientes/:id` |
| Repartidores | `GET` y `POST` en `/api/repartidores`; `GET`, `PUT` y `DELETE` en `/api/repartidores/:id` |
| Pedidos | `GET` y `POST` en `/api/pedidos`; `GET`, `PUT` y `DELETE` en `/api/pedidos/:id` |

## Ejemplos

Las peticiones con cuerpo se envían como JSON (en Postman: Body → raw → JSON).

### 1. Crear un cliente

`POST http://localhost:3001/api/clientes`

```json
{
  "nombre": "Ana Pérez",
  "correo": "ana@correo.com",
  "telefono": "5512345678",
  "direccion": "Calle 1 #10"
}
```

Respuesta `201 Created`:

```json
{
  "id": 1,
  "nombre": "Ana Pérez",
  "correo": "ana@correo.com",
  "telefono": "5512345678",
  "direccion": "Calle 1 #10"
}
```

### 2. Crear un repartidor

`POST http://localhost:3001/api/repartidores`

```json
{
  "nombre": "Luis Gómez",
  "correo": "luis@correo.com",
  "telefono": "5587654321",
  "vehiculo": "Moto"
}
```

Respuesta `201 Created`:

```json
{
  "id": 1,
  "nombre": "Luis Gómez",
  "correo": "luis@correo.com",
  "telefono": "5587654321",
  "vehiculo": "Moto",
  "disponible": true
}
```

### 3. Crear un pedido

`POST http://localhost:3001/api/pedidos`

```json
{
  "clienteId": 1,
  "descripcion": "Pizza grande"
}
```

Respuesta `201 Created` (la dirección sale del cliente):

```json
{
  "id": 1,
  "clienteId": 1,
  "clienteNombre": "Ana Pérez",
  "repartidorId": null,
  "repartidorNombre": null,
  "descripcion": "Pizza grande",
  "direccionEntrega": "Calle 1 #10",
  "estado": "PENDIENTE"
}
```

### 4. Asignar repartidor y enviar el pedido

`PUT http://localhost:3001/api/pedidos/1`

```json
{
  "repartidorId": 1,
  "estado": "EN_CAMINO"
}
```

Todos los campos de este `PUT` son opcionales (`descripcion`, `repartidorId`, `estado`).

## Códigos de respuesta

| Código | Significado | Ejemplo |
|---|---|---|
| 200 | Correcto | Listar, obtener o actualizar |
| 201 | Creado | Crear un registro |
| 204 | Sin contenido | Eliminar |
| 400 | Datos inválidos | Correo mal escrito o teléfono de 9 dígitos |
| 404 | No existe | Cliente o pedido con un id inexistente |
| 409 | Choca con una regla de negocio | Correo repetido o pedido que no puede cambiar de estado |

Los errores se devuelven siempre con este formato:

```json
{
  "error": "Ya existe un cliente con ese correo"
}
```

## Imágenes

Cada cliente, repartidor y pedido puede tener una imagen (PNG o JPG, máximo 2 MB). Se guarda en MongoDB junto al registro.

| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/api/clientes/:id/imagen` | Sube la imagen del cliente |
| PUT | `/api/repartidores/:id/imagen` | Sube la imagen del repartidor |
| PUT | `/api/pedidos/:id/imagen` | Sube la imagen del pedido |
| GET | `/api/clientes/:id/imagen` | Devuelve la imagen del cliente |
| GET | `/api/repartidores/:id/imagen` | Devuelve la imagen del repartidor |
| GET | `/api/pedidos/:id/imagen` | Devuelve la imagen del pedido |

Para subirla en Postman: método `PUT`, Body → form-data, clave `imagen` de tipo **File** y el archivo elegido.

Reglas:

- Solo se aceptan PNG y JPG. Se revisa el contenido real del archivo, no la extensión.
- Si pesa más de 2 MB o no se envía archivo, responde `400`.
- Si el registro no existe o no tiene imagen, responde `404`.
- Cuando un registro tiene imagen, su JSON incluye `"imagen": "/api/<recurso>/<id>/imagen"`. Si no, `"imagen": null`.

## Reporte en PDF

```
GET /api/pedidos/:id/reporte
```

Genera un PDF del pedido con tres secciones: **Pedido**, **Cliente** y **Repartidor**, cada una con sus datos y su imagen. Si falta una imagen aparece "Sin imagen", y si el pedido no tiene repartidor lo indica. El PDF se genera en el momento y no se guarda en disco.

- Se abre directo en el navegador: `http://localhost:3001/api/pedidos/1/reporte`
- En Postman usa **Send and Download**.
- Si el pedido no existe responde `404`.

## Pruebas

### Postman

La colección está en `postman/`. Para usarla:

1. En Postman pulsa **Import** y elige el archivo `.json`.
2. Con la API corriendo, ejecútala con **Run collection**, en el orden de las carpetas: cada petición guarda los ids que usa la siguiente.
3. La variable `baseUrl` de la colección apunta a `http://localhost:3001/api`. Cámbiala si la API está desplegada en otra URL.
4. En las peticiones de subir imagen hay que elegir un archivo antes de enviarlas.

### K6 (carga)

El script está en `k6/prueba.js`. Simula 5 usuarios durante 20 segundos: lista datos, crea un cliente y un pedido, descarga el reporte PDF, y elimina lo que creó.

Con la API corriendo, desde la raíz del proyecto:

```
docker run --rm -i -e BASE_URL=http://host.docker.internal:3001/api/ -v "${PWD}:/app" -w /app grafana/k6 run k6/prueba.js
```

Al terminar se genera `index.html` con el reporte. La prueba falla si más del 1% de las peticiones da error o si el 95% de las respuestas tarda más de 2 segundos.

## Estructura actual

```
k6/
  prueba.js
postman/
  <colección de Postman>.json
src/
  baseDeDatos/     modelos de Mongoose, conexión y contador de ids
  controladores/   reciben la petición y responden
  dtos/            validan la entrada y dan forma a la salida
  errores/         errores personalizados y manejador central
  rutas/           index.js: rutas y arranque del servidor
  servicios/       reglas de negocio y reporte PDF
```
