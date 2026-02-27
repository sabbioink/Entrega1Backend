const socket = io();

const form = document.getElementById("productForm");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const product = {
        title: formData.get("title"),
        description: formData.get("description"),
        price: Number(formData.get("price")),
        thumbnail: formData.get("thumbnail"),
        code: formData.get("code"),
        stock: Number(formData.get("stock"))
    };

    socket.emit("newProduct", product);
    form.reset();
});

socket.on("updateProducts", (products) => {
    const list = document.getElementById("productList");
    list.innerHTML = "";

    products.forEach(prod => {
        list.innerHTML += `
            <li>
                ${prod.title} - $${prod.price}
                <button onclick="deleteProduct('${prod.id}')">Eliminar</button>
            </li>
        `;
    });
});

function deleteProduct(id) {
    socket.emit("deleteProduct", id);
}