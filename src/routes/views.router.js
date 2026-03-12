const { Router } = require('express');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

const router = Router();

router.get('/', async (req, res) => {
    try {
        const products = await Product.find().lean();
        res.render('home', { products });
    } catch (error) {
        res.status(500).send('Error al cargar productos');
    }
});

router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        let filter = {};
        if (query) {
            if (query === 'available') {
                filter.stock = { $gt: 0 };
            } else {
                filter.category = query;
            }
        }

        let sortOption = {};
        if (sort === 'asc') sortOption.price = 1;
        if (sort === 'desc') sortOption.price = -1;

        const result = await Product.paginate(filter, {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sortOption,
            lean: true
        });

        const baseUrl = `/products?limit=${limit}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}`;

        res.render('products', {
            products: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `${baseUrl}&page=${result.prevPage}` : null,
            nextLink: result.hasNextPage ? `${baseUrl}&page=${result.nextPage}` : null,
            query: query || '',
            sort: sort || ''
        });

    } catch (error) {
        res.status(500).send('Error al cargar productos');
    }
});

router.get('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid).lean();

        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        res.render('productDetail', { product });

    } catch (error) {
        res.status(500).send('Error al cargar el producto');
    }
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product').lean();

        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        res.render('cart', { cart });

    } catch (error) {
        res.status(500).send('Error al cargar el carrito');
    }
});


router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find().lean();
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).send('Error al cargar productos en tiempo real');
    }
});

module.exports = router;