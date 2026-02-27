const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');

const ProductManager = require('./managers/ProductManager');

const app = express();
const PORT = 8080;

const httpServer = http.createServer(app);
const io = new Server(httpServer);
app.set('io', io);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

const productManager = new ProductManager('./src/data/products.json');

io.on('connection', async (socket) => {
    console.log('Cliente conectado');

    try {
        const products = await productManager.getProducts();
        socket.emit('updateProducts', products);
    } catch (error) {
        console.error('Error al obtener productos:', error.message);
    }

    socket.on('newProduct', async (product) => {
        try {
            await productManager.addProduct(product);
            const updatedProducts = await productManager.getProducts();
            io.emit('updateProducts', updatedProducts);
        } catch (error) {
            console.error('Error al agregar producto:', error.message);
        }
    });

    socket.on('deleteProduct', async (id) => {
        try {
            await productManager.deleteProduct(id);
            const updatedProducts = await productManager.getProducts();
            io.emit('updateProducts', updatedProducts);
        } catch (error) {
            console.error('Error al eliminar producto:', error.message);
        }
    });
});

app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada'
    });
});

httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});