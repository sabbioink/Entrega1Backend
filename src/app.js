const express = require('express');
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', (req, res) => {
    res.json({
        message: 'API de Gestión de Productos y Carritos',
        endpoints: {
            products: {
                'GET /api/products': 'Listar todos los productos',
                'GET /api/products/:pid': 'Obtener producto por ID',
                'POST /api/products': 'Crear nuevo producto',
                'PUT /api/products/:pid': 'Actualizar producto',
                'DELETE /api/products/:pid': 'Eliminar producto'
            },
            carts: {
                'POST /api/carts': 'Crear nuevo carrito',
                'GET /api/carts/:cid': 'Listar productos del carrito',
                'POST /api/carts/:cid/product/:pid': 'Agregar producto al carrito'
            }
        }
    });
});


app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada'
    });
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log('\n📦 Endpoints de Productos:');
    console.log(`  GET    http://localhost:${PORT}/api/products`);
    console.log(`  GET    http://localhost:${PORT}/api/products/:pid`);
    console.log(`  POST   http://localhost:${PORT}/api/products`);
    console.log(`  PUT    http://localhost:${PORT}/api/products/:pid`);
    console.log(`  DELETE http://localhost:${PORT}/api/products/:pid`);
    console.log('\n🛒 Endpoints de Carritos:');
    console.log(`  POST   http://localhost:${PORT}/api/carts`);
    console.log(`  GET    http://localhost:${PORT}/api/carts/:cid`);
    console.log(`  POST   http://localhost:${PORT}/api/carts/:cid/product/:pid`);
});

module.exports = app;
