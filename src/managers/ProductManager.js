const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async getProducts() {
        if (!fs.existsSync(this.path)) {
            return [];
        }
        const data = await fs.promises.readFile(this.path, 'utf-8');
        return JSON.parse(data || '[]');
    }

    async addProduct(product) {
        const requiredFields = ['title', 'description', 'price', 'thumbnail', 'code', 'stock'];

        for (const field of requiredFields) {
            if (
                product[field] === undefined ||
                product[field] === null ||
                product[field] === ''
            ) {
                throw new Error(`El campo '${field}' es requerido`);
            }
        }

        const products = await this.getProducts();

        const newProduct = {
            id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
            title: product.title,
            description: product.description,
            price: product.price,
            thumbnail: product.thumbnail,
            code: product.code,
            stock: product.stock
        };

        products.push(newProduct);

        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));

        return newProduct;
    }

    async deleteProduct(id) {
        const products = await this.getProducts();
        const filteredProducts = products.filter(p => p.id !== Number(id));

        if (products.length === filteredProducts.length) {
            throw new Error('Producto no encontrado');
        }

        await fs.promises.writeFile(this.path, JSON.stringify(filteredProducts, null, 2));

        return true;
    }
}

module.exports = ProductManager;