const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');
const Product = require('./models/Product');

const app = express();
const PORT = 8080;

const MONGO_URI = 'mongodb://localhost:27017/ecommerce';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

const httpServer = http.createServer(app);
const io = new Server(httpServer);
app.set('io', io);


app.engine('handlebars', engine({
    helpers: {
        eq: (a, b) => a === b
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);


io.on('connection', async (socket) => {
    console.log('Cliente conectado');

    try {
        const products = await Product.find().lean();
        socket.emit('updateProducts', products);
    } catch (error) {
        console.error('Error al obtener productos:', error.message);
    }

    socket.on('newProduct', async (product) => {
        try {
            await Product.create(product);
            const updatedProducts = await Product.find().lean();
            io.emit('updateProducts', updatedProducts);
        } catch (error) {
            console.error('Error al agregar producto:', error.message);
        }
    });

    socket.on('deleteProduct', async (id) => {
        try {
            await Product.findByIdAndDelete(id);
            const updatedProducts = await Product.find().lean();
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