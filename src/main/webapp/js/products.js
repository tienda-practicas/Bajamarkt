document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    loadCategoryOptions();

    const form = document.getElementById("productForm");
    form.addEventListener("submit", createProduct);

    // Live image preview as the user types/pastes a URL
    const imageInput = document.getElementById("image");
    const imagePreview = document.getElementById("imagePreview");

    imageInput.addEventListener("input", () => {
        const url = imageInput.value.trim();
        if (url) {
            imagePreview.src = url;
            imagePreview.classList.remove("d-none");
        } else {
            imagePreview.classList.add("d-none");
        }
    });

    imagePreview.addEventListener("error", () => {
        imagePreview.classList.add("d-none"); // Hide on broken URL
    });
});

function fetchProducts() {
    fetch('api/products')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("productTableBody");
            tableBody.innerHTML = "";

            data.forEach(product => {
                const stockBadge = product.stock > 10
                    ? `<span class="badge bg-success">${product.stock}</span>`
                    : `<span class="badge bg-warning text-dark">${product.stock} (Low)</span>`;

                const imageCell = product.image
                    ? `<img src="${product.image}" alt="${product.name}"
                            style="width: 60px; height: 60px; object-fit: cover;"
                            class="rounded"
                            onerror="this.style.display='none'">`
                    : `<span class="text-muted small">No image</span>`;

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${imageCell}</td>
                    <td><strong>${product.name}</strong></td>
                    <td>${product.idCategory}</td>
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
                if (category.active) {
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
    const stock = document.getElementById("stockQuantity").value;
    const image = document.getElementById("image").value.trim();

    const newProduct = {
        name: name,
        price: parseFloat(price),
        stock: parseInt(stock),
        image: image,                    // image URL (may be empty)
        idCategory: parseInt(categoryId)
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
                document.getElementById("imagePreview").classList.add("d-none");
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