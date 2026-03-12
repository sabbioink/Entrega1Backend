const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const newCart = await Cart.create({ products: [] });
        res.status(201).json({
            status: 'success',
            message: 'Carrito creado exitosamente',
            payload: newCart
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al crear el carrito',
            error: error.message
        });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await Cart.findById(cid).populate('products.product');

        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: `Carrito con ID ${cid} no encontrado`
            });
        }

        res.json({
            status: 'success',
            payload: cart
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener el carrito',
            error: error.message
        });
    }
});

router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: `Carrito con ID ${cid} no encontrado`
            });
        }

        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: `Producto con ID ${pid} no encontrado`
            });
        }

        const existingProduct = cart.products.find(p => p.product.toString() === pid);
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await cart.save();

        res.json({
            status: 'success',
            message: 'Producto agregado al carrito exitosamente',
            payload: cart
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al agregar producto al carrito',
            error: error.message
        });
    }
});

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: `Carrito con ID ${cid} no encontrado`
            });
        }

        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        await cart.save();

        res.json({
            status: 'success',
            message: 'Producto eliminado del carrito'
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error eliminando producto del carrito',
            error: error.message
        });
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        const updatedCart = await Cart.findByIdAndUpdate(
            cid,
            { products: req.body.products },
            { new: true }
        );

        if (!updatedCart) {
            return res.status(404).json({
                status: 'error',
                message: `Carrito con ID ${cid} no encontrado`
            });
        }

        res.json({
            status: 'success',
            message: 'Carrito actualizado',
            payload: updatedCart
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error actualizando carrito',
            error: error.message
        });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'La cantidad debe ser un número mayor a 0'
            });
        }

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: `Carrito con ID ${cid} no encontrado`
            });
        }

        const product = cart.products.find(p => p.product.toString() === pid);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: `Producto con ID ${pid} no encontrado en el carrito`
            });
        }

        product.quantity = quantity;
        await cart.save();

        res.json({
            status: 'success',
            message: 'Cantidad actualizada',
            payload: cart
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error actualizando cantidad',
            error: error.message
        });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await Cart.findByIdAndUpdate(cid, { products: [] }, { new: true });

        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: `Carrito con ID ${cid} no encontrado`
            });
        }

        res.json({
            status: 'success',
            message: 'Carrito vaciado'
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error vaciando carrito',
            error: error.message
        });
    }
});

module.exports = router;