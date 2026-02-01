const express = require('express');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();
const productManager = new ProductManager('./src/data/products.json');

router.get('/', (req, res) => {
  try {
    const products = productManager.getProducts();
    res.json({
      status: 'success',
      payload: products
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener productos',
      error: error.message
    });
  }
});

router.get('/:pid', (req, res) => {
  try {
    const { pid } = req.params;
    const product = productManager.getProductById(pid);

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


router.post('/', (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails, status } = req.body;

    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos requeridos: title, description, code, price, stock, category'
      });
    }

    const newProduct = productManager.addProduct({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
      status
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

router.put('/:pid', (req, res) => {
  try {
    const { pid } = req.params;
    const updates = req.body;

    if (updates.id) {
      return res.status(400).json({
        status: 'error',
        message: 'No se puede actualizar el ID del producto'
      });
    }

    const updatedProduct = productManager.updateProduct(pid, updates);

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

router.delete('/:pid', (req, res) => {
  try {
    const { pid } = req.params;
    const deletedProduct = productManager.deleteProduct(pid);

    if (!deletedProduct) {
      return res.status(404).json({
        status: 'error',
        message: `Producto con ID ${pid} no encontrado`
      });
    }

    res.json({
      status: 'success',
      message: 'Producto eliminado exitosamente',
      payload: deletedProduct
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
