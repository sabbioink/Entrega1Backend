const fs = require('fs');

class CartManager {
    constructor(path) {
        this.path = path;
        this.carts = [];
        this.nextId = 1;

        this.init();
    }

    init() {
        try {
            if (fs.existsSync(this.path)) {
                const data = fs.readFileSync(this.path, 'utf-8');

                if (!data.trim()) {
                    fs.writeFileSync(this.path, JSON.stringify([], null, 2));
                    this.products = [];
                    this.nextId = 1;
                    return;
                }

                this.products = JSON.parse(data);

                if (this.products.length > 0) {
                    this.nextId = Math.max(...this.products.map(p => p.id)) + 1;
                }
            } else {
                fs.writeFileSync(this.path, JSON.stringify([], null, 2));
                this.products = [];
                this.nextId = 1;
            }
        } catch (error) {
            console.error('Error al inicializar ProductManager:', error);
            this.products = [];
            this.nextId = 1;
        }
    }


    saveToFile() {
        try {
            fs.writeFileSync(this.path, JSON.stringify(this.carts, null, 2));
            return true;
        } catch (error) {
            console.error('Error al guardar en archivo:', error);
            return false;
        }
    }

    createCart() {
        try {
            const newCart = {
                id: this.nextId++,
                products: []
            };

            this.carts.push(newCart);
            this.saveToFile();

            return newCart;
        } catch (error) {
            throw error;
        }
    }

    getCartById(id) {
        try {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.carts = JSON.parse(data);

            const cart = this.carts.find(c => c.id === parseInt(id));

            if (!cart) {
                return null;
            }

            return cart;
        } catch (error) {
            throw error;
        }
    }

    addProductToCart(cartId, productId) {
        try {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.carts = JSON.parse(data);

            const cartIndex = this.carts.findIndex(c => c.id === parseInt(cartId));

            if (cartIndex === -1) {
                return null;
            }

            const cart = this.carts[cartIndex];
            const productIndex = cart.products.findIndex(
                p => p.product === parseInt(productId)
            );

            if (productIndex !== -1) {
                cart.products[productIndex].quantity += 1;
            } else {
                cart.products.push({
                    product: parseInt(productId),
                    quantity: 1
                });
            }

            this.carts[cartIndex] = cart;
            this.saveToFile();

            return cart;
        } catch (error) {
            throw error;
        }
    }

    getCarts() {
        try {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.carts = JSON.parse(data);
            return this.carts;
        } catch (error) {
            console.error('Error al leer carritos:', error);
            return [];
        }
    }
}

module.exports = CartManager;
