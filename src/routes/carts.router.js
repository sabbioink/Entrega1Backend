const express = require('express');
const CartManager = require('../managers/CartManager');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();
const cartManager = new CartManager('./src/data/carts.json');
const productManager = new ProductManager('./src/data/products.json');

router.post('/', (req, res) => {
  try {
    const newCart = cartManager.createCart();

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

router.get('/:cid', (req, res) => {
  try {
    const { cid } = req.params;
    const cart = cartManager.getCartById(cid);

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

router.post('/:cid/product/:pid', (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con ID ${cid} no encontrado`
      });
    }

    const product = productManager.getProductById(pid);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: `Producto con ID ${pid} no encontrado`
      });
    }

    const updatedCart = cartManager.addProductToCart(cid, pid);

    res.json({
      status: 'success',
      message: 'Producto agregado al carrito exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al agregar producto al carrito',
      error: error.message
    });
  }
});

module.exports = router;
