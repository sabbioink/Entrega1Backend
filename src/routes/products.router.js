const express = require('express');
const Product = require('../models/Product');

const router = express.Router();


router.get('/', async (req, res) => {
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
            sort: sortOption
        });

        const baseUrl = `/api/products?limit=${limit}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}`;
        const prevLink = result.hasPrevPage ? `${baseUrl}&page=${result.prevPage}` : null;
        const nextLink = result.hasNextPage ? `${baseUrl}&page=${result.nextPage}` : null;

        res.json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink,
            nextLink
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener productos',
            error: error.message
        });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await Product.findById(pid);

        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: `Producto con ID ${pid} no encontrado`
            });
        }

        res.json({
            status: 'success',
            payload: product
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener el producto',
            error: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails, status } = req.body;

        if (!title || !description || !code || price === undefined || stock === undefined || !category) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan campos requeridos: title, description, code, price, stock, category'
            });
        }

        const newProduct = await Product.create({
            title, description, code, price, stock, category,
            thumbnails: thumbnails || [],
            status: status !== undefined ? status : true
        });

        res.status(201).json({
            status: 'success',
            message: 'Producto creado exitosamente',
            payload: newProduct
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const updates = req.body;

        if (updates._id) {
            return res.status(400).json({
                status: 'error',
                message: 'No se puede actualizar el ID del producto'
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(pid, updates, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({
                status: 'error',
                message: `Producto con ID ${pid} no encontrado`
            });
        }

        res.json({
            status: 'success',
            message: 'Producto actualizado exitosamente',
            payload: updatedProduct
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});


router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const deleted = await Product.findByIdAndDelete(pid);

        if (!deleted) {
            return res.status(404).json({
                status: 'error',
                message: `Producto con ID ${pid} no encontrado`
            });
        }

        res.json({
            status: 'success',
            message: 'Producto eliminado exitosamente',
            payload: deleted
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
});

module.exports = router;