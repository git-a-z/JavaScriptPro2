const API = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';

class ProductsList {
    constructor(container = '.products', path = '/catalogData.json') {
        this.container = container;
        this.goods = [];
        this.allProducts = [];
        this.path = path;
        this._getProducts();
    }

    _getProducts() {
        return fetch(`${API}${this.path}`)
            .then(result => result.json())
            .then(data => {
                this.goods = [...data];
                this.render();
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        const block = document.querySelector(this.container);
        for (let product of this.goods) {
            const productObj = new ProductItem(product);
            this.allProducts.push(productObj);
            block.insertAdjacentHTML('beforeend', productObj.render());
        }
    }
}

class ProductItem {
    constructor(product, img = 'https://via.placeholder.com/200x150') {
        this.product_name = product.product_name;
        this.price = product.price;
        this.id_product = product.id_product;
        this.img = img;
    }

    render() {
        return `<div class="product-item" data-id="${this.id_product}">
                    <img src="${this.img}" alt="Some img">
                    <h3>${this.product_name}</h3>
                    <p>${this.price} ₽</p>
                    <button class="buy-btn" onclick="cart.addToBasket(${this.id_product})">Купить</button>
                </div>`;
    }
}

class Basket extends ProductsList {
    constructor(container = '.cart-text', path = '/getBasket.json') {
        super(container, path);
    }

    _getProducts() {
        return fetch(`${API}${this.path}`)
            .then(result => result.json())
            .then(data => {
                this.goods = [...data.contents];
                this.render();
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        const block = document.querySelector(this.container);
        block.innerHTML = '';
        for (let product of this.goods) {
            const productObj = new BasketItem(product, product.quantity);
            this.allProducts.push(productObj);
            block.insertAdjacentHTML('beforeend', productObj.render());
        }
        block.insertAdjacentHTML('beforeend', this.getFooter());
    }

    renderBasket() {
        const block = document.querySelector(this.container);
        block.innerHTML = '';
        for (let product of this.allProducts) {
            block.insertAdjacentHTML('beforeend', product.render());
        }
        block.insertAdjacentHTML('beforeend', this.getFooter());
    }

    getFooter() {
        return `<h5 class="cart-total">Всего товаров: <span class="cart-num">${this.getQuantity()} шт.<span></h5>
                <h5 class="cart-total">Общая сумма: <span class="cart-num">${this.getSum()} ₽<span></h5>
                <button class="buy-btn clear-btn" onclick="cart.clearBasket()">Очистить</button>`;
    }

    getQuantity() {
        return this.allProducts.reduce((sum, item) => sum += item.quantity, 0);
    }

    getSum() {
        return this.allProducts.reduce((sum, item) => sum += item.price * item.quantity, 0);
    }

    addToBasket(id) {
        let foundElem = this.allProducts.find(x => x.id_product === id);
        if (foundElem === undefined) {
            let listElem = list.allProducts.find(x => x.id_product === id);
            if (listElem !== undefined) {
                this.allProducts.push(new BasketItem(listElem));
            }
        } else {
            foundElem.quantity++;
        }
        this.renderBasket();
    }

    removeFromBasket(id) {
        let foundElem = this.allProducts.find(x => x.id_product === id);
        if (foundElem !== undefined) {
            if (foundElem.quantity > 1) {
                foundElem.quantity--;
                this.renderBasket();
            } else {
                this.clearBasketItem(id);
            }
        }
    }

    clearBasketItem(id) {
        let foundElem = this.allProducts.findIndex(x => x.id_product === id);
        if (foundElem >= 0) {
            this.allProducts.splice(foundElem, 1);
        }
        this.renderBasket();
    }

    clearBasket() {
        this.allProducts = [];
        this.renderBasket();
    }
}

class BasketItem extends ProductItem {
    constructor(product, quantity = 1) {
        super(product, '');
        this.quantity = quantity;
    }

    render() {
        return `<div class="basket-item" data-id="${this.id_product}">
                    <h5>${this.product_name}</h5>
                    <p>${this.price} ₽</p>
                    <p>${this.quantity} шт.</p>
                    <a href="#" class="btn-cart-item-close" onclick="cart.clearBasketItem(${this.id_product})">×</a>
                    <a href="#" class="btn-cart-item-minus" onclick="cart.removeFromBasket(${this.id_product})">−</a>
                </div>`;
    }
}

const renderCart = () => {
    return `<div class="overlay">
                <div class="cart-content">
                    <div class="cart-text"></div>
                </div>
            </div>`;
};

let list = new ProductsList();
let cart = new Basket();

let btnCart = document.querySelector('.btn-cart');
btnCart.insertAdjacentHTML('afterend', renderCart());
btnCart.addEventListener('click', () => { document.querySelector('.overlay').classList.toggle('overlay-open') });