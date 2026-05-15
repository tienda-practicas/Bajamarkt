document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    loadCategoryOptions();

    const form = document.getElementById("productForm");
    form.addEventListener("submit", createProduct);
});

function fetchProducts() {
    fetch('api/products')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("productTableBody");
            tableBody.innerHTML = "";

            data.forEach(product => {
                const stockBadge = product.stockQuantity > 10
                    ? `<span class="badge bg-success">${product.stockQuantity}</span>`
                    : `<span class="badge bg-warning text-dark">${product.stockQuantity} (Low)</span>`;

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td><strong>${product.name}</strong></td>
                    <td>${product.categoryId}</td>
                    <td>€${product.price.toFixed(2)}</td>
                    <td>${stockBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching products:", error));
}

function loadCategoryOptions() {
    fetch('api/categories')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("categoryId");
            data.forEach(category => {
                if (category.active) { // Only show active categories
                    const option = document.createElement("option");
                    option.value = category.id;
                    option.textContent = category.name;
                    select.appendChild(option);
                }
            });
        })
        .catch(error => console.error("Error fetching categories for select:", error));
}

function createProduct(event) {
    event.preventDefault();

    const categoryId = document.getElementById("categoryId").value;
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const stockQuantity = document.getElementById("stockQuantity").value;

    const newProduct = {
        categoryId: parseInt(categoryId),
        name: name,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity)
    };

    fetch('api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    })
        .then(response => {
            if (response.ok) {
                document.getElementById("productForm").reset();
                fetchProducts();
            } else {
                alert("Error creating product");
            }
        })
        .catch(error => console.error("Error:", error));
}

function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        fetch(`api/products?id=${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    fetchProducts();
                } else {
                    alert("Error deleting product");
                }
            })
            .catch(error => console.error("Error:", error));
    }
}