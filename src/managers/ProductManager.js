const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = [];
        this.nextId = 1;

        this.init();
    }

    init() {
        try {
            if (fs.existsSync(this.path)) {
                const data = fs.readFileSync(this.path, 'utf-8');

                if (!data.trim()) {
                    fs.writeFileSync(this.path, JSON.stringify([], null, 2));
                    this.carts = [];
                    this.nextId = 1;
                    return;
                }

                this.carts = JSON.parse(data);

                if (this.carts.length > 0) {
                    this.nextId = Math.max(...this.carts.map(c => c.id)) + 1;
                }
            } else {
                fs.writeFileSync(this.path, JSON.stringify([], null, 2));
                this.carts = [];
                this.nextId = 1;
            }
        } catch (error) {
            console.error('Error al inicializar CartManager:', error);
            this.carts = [];
            this.nextId = 1;
        }
    }


    saveToFile() {
        try {
            fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
            return true;
        } catch (error) {
            console.error('Error al guardar en archivo:', error);
            return false;
        }
    }

    addProduct(product) {
        try {
            const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
            for (const field of requiredFields) {
                if (product[field] === undefined || product[field] === null) {
                    throw new Error(`El campo '${field}' es requerido`);
                }
            }

            const codeExists = this.products.some(p => p.code === product.code);
            if (codeExists) {
                throw new Error(`Ya existe un producto con el código '${product.code}'`);
            }
            const newProduct = {
                id: this.nextId++,
                title: product.title,
                description: product.description,
                code: product.code,
                price: product.price,
                status: product.status !== undefined ? product.status : true,
                stock: product.stock,
                category: product.category,
                thumbnails: product.thumbnails || []
            };


            this.products.push(newProduct);
            this.saveToFile();

            return newProduct;
        } catch (error) {
            throw error;
        }
    }
    getProducts() {
        try {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.products = JSON.parse(data);
            return this.products;
        } catch (error) {
            console.error('Error al leer productos:', error);
            return [];
        }
    }

    getProductById(id) {
        try {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.products = JSON.parse(data);

            const product = this.products.find(p => p.id === parseInt(id));

            if (!product) {
                return null;
            }

            return product;
        } catch (error) {
            throw error;
        }
    }

    updateProduct(id, updates) {
        try {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.products = JSON.parse(data);

            const index = this.products.findIndex(p => p.id === parseInt(id));

            if (index === -1) {
                return null;
            }

            if (updates.id) {
                delete updates.id;
            }
            if (updates.code) {
                const codeExists = this.products.some(
                    p => p.code === updates.code && p.id !== parseInt(id)
                );
                if (codeExists) {
                    throw new Error(`Ya existe un producto con el código '${updates.code}'`);
                }
            }
            this.products[index] = {
                ...this.products[index],
                ...updates
            };

            this.saveToFile();

            return this.products[index];
        } catch (error) {
            throw error;
        }
    }

    deleteProduct(id) {
        try {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.products = JSON.parse(data);

            const index = this.products.findIndex(p => p.id === parseInt(id));

            if (index === -1) {
                return null;
            }

            const deletedProduct = this.products[index];
            this.products.splice(index, 1);
            this.saveToFile();

            return deletedProduct;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ProductManager;
