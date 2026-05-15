document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    loadCategoryOptions();

    document.getElementById("productForm").addEventListener("submit", saveProduct);
    document.getElementById("cancelBtn").addEventListener("click", resetForm);

    // Live image preview
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
        imagePreview.classList.add("d-none");
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
                        <button class="btn btn-sm btn-primary me-1" onclick="editProduct(${product.id})">Edit</button>
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
            // Keep the placeholder, remove any other previously loaded options
            select.querySelectorAll("option:not([disabled])").forEach(opt => opt.remove());

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

// Decides whether to POST (create) or PUT (update) based on whether the hidden ID is set
function saveProduct(event) {
    event.preventDefault();

    const id = document.getElementById("productId").value;
    const categoryId = document.getElementById("categoryId").value;
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const stock = document.getElementById("stockQuantity").value;
    const image = document.getElementById("image").value.trim();

    const product = {
        name: name,
        price: parseFloat(price),
        stock: parseInt(stock),
        image: image,
        idCategory: parseInt(categoryId)
    };

    let method;
    if (id) {
        product.id = parseInt(id);
        method = "PUT";
    } else {
        method = "POST";
    }

    fetch('api/products', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    })
        .then(response => {
            if (response.ok) {
                resetForm();
                fetchProducts();
            } else {
                alert(id ? "Error updating product" : "Error creating product");
            }
        })
        .catch(error => console.error("Error:", error));
}

function editProduct(id) {
    fetch(`api/products?id=${id}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById("productId").value = product.id;
            document.getElementById("categoryId").value = product.idCategory;
            document.getElementById("name").value = product.name;
            document.getElementById("price").value = product.price;
            document.getElementById("stockQuantity").value = product.stock;
            document.getElementById("image").value = product.image || "";

            // Show preview if there's an image
            const imagePreview = document.getElementById("imagePreview");
            if (product.image) {
                imagePreview.src = product.image;
                imagePreview.classList.remove("d-none");
            } else {
                imagePreview.classList.add("d-none");
            }

            // Switch UI to edit mode
            document.getElementById("formTitle").textContent = `Edit Product #${product.id}`;
            document.getElementById("submitBtn").textContent = "Update Product";
            document.getElementById("submitBtn").classList.remove("btn-success");
            document.getElementById("submitBtn").classList.add("btn-primary");
            document.getElementById("cancelBtn").classList.remove("d-none");

            window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch(error => console.error("Error loading product:", error));
}

function resetForm() {
    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";
    document.getElementById("imagePreview").classList.add("d-none");
    document.getElementById("formTitle").textContent = "Add New Product";
    document.getElementById("submitBtn").textContent = "Save Product";
    document.getElementById("submitBtn").classList.remove("btn-primary");
    document.getElementById("submitBtn").classList.add("btn-success");
    document.getElementById("cancelBtn").classList.add("d-none");
}

function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        fetch(`api/products?id=${id}`, { method: 'DELETE' })
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