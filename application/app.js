const products = [

    {
        id: 1,
        name: "iPhone 15",
        price: 70000,
        stock: 5,
        image: "https://picsum.photos/300?1"
    },

    {
        id: 2,
        name: "Samsung S24",
        price: 65000,
        stock: 0,
        image: "https://picsum.photos/300?2"
    },

    {
        id: 3,
        name: "MacBook Air",
        price: 98000,
        stock: 2,
        image: "https://picsum.photos/300?3"
    },

    {
        id: 4,
        name: "Gaming Mouse",
        price: 1500,
        stock: 10,
        image: "https://picsum.photos/300?4"
    },

    {
        id: 5,
        name: "Mechanical Keyboard",
        price: 3500,
        stock: 4,
        image: "https://picsum.photos/300?5"
    },

    {
        id: 6,
        name: "Sony Headphones",
        price: 6000,
        stock: 3,
        image: "https://picsum.photos/300?6"
    }

];

let cart = [];

const productContainer = document.getElementById("products");

function render(list = products) {

    productContainer.innerHTML = "";

    list.forEach(product => {

        productContainer.innerHTML += `

<div class="card">

<img src="${product.image}">

<div class="details">

<h3>${product.name}</h3>

<p class="price">₹${product.price}</p>

<p class="stock">

Stock : ${product.stock}

</p>

<button onclick="addToCart(${product.id})">

Add to Cart

</button>

</div>

</div>

`;

    });

}

function addToCart(id) {

    const product = products.find(p => p.id === id);

    /* Intentional Bug
    Out of stock product can still be added
    */

    cart.push(product);

    updateCart();

}

function updateCart() {

    const items = document.getElementById("items");

    items.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        items.innerHTML += `

<div>

${item.name}

</div>

`;

        total += item.price;

    });

    document.getElementById("count").innerHTML = cart.length;

    /* Intentional Bug
    Wrong cart total
    */

    document.getElementById("total").innerHTML =
        "Total : ₹" + (total - 100);

}

function search() {

    let keyword = document
        .getElementById("search")
        .value;

    /* Intentional Bug
    Case Sensitive Search
    */

    const filtered = products.filter(product =>

        product.name.includes(keyword)

    );

    render(filtered);

}

render();