let searchDebounce = null;

document.addEventListener("DOMContentLoaded", () => {
    loadCategoryOptions();
    fetchProducts();

    document.getElementById("productForm").addEventListener("submit", saveProduct);
    document.getElementById("cancelBtn").addEventListener("click", resetForm);

    document.getElementById("searchInput").addEventListener("input", debouncedFetch);
    document.getElementById("priceMin").addEventListener("input", debouncedFetch);
    document.getElementById("priceMax").addEventListener("input", debouncedFetch);

    document.getElementById("categoryFilter").addEventListener("change", fetchProducts);
    document.getElementById("stockFilter").addEventListener("change", fetchProducts);
    document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);

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
    imagePreview.addEventListener("error", () => imagePreview.classList.add("d-none"));
});

function debouncedFetch() {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(fetchProducts, 300);
}

function buildQueryString() {
    const search   = document.getElementById("searchInput").value.trim();
    const category = document.getElementById("categoryFilter").value;
    const stock    = document.getElementById("stockFilter").value;
    const priceMin = document.getElementById("priceMin").value;
    const priceMax = document.getElementById("priceMax").value;

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category && category !== "all") params.append("category", category);
    if (stock && stock !== "all") params.append("stock", stock);
    if (priceMin) params.append("priceMin", priceMin);
    if (priceMax) params.append("priceMax", priceMax);

    const query = params.toString();
    return query ? `?${query}` : "";
}

function fetchProducts() {
    fetch('api/products' + buildQueryString())
        .then(response => response.json())
        .then(renderProducts)
        .catch(error => console.error("Error fetching products:", error));
}

function renderProducts(products) {
    const tableBody = document.getElementById("productTableBody");
    tableBody.innerHTML = "";

    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    No products match your filters.
                </td>
            </tr>`;
    } else {
        products.forEach(product => {
            const stockBadge = product.stock > 10
                ? `<span class="badge bg-success">${product.stock}</span>`
                : product.stock === 0
                    ? `<span class="badge bg-danger">${product.stock} (Out)</span>`
                    : `<span class="badge bg-warning text-dark">${product.stock} (Low)</span>`;

            const imageCell = product.image
                ? `<img src="${product.image}" alt="${product.name}"
                        style="width: 60px; height: 60px; object-fit: cover;"
                        class="rounded"
                        onerror="this.style.display='none'">`
                : `<span class="text-muted small">No image</span>`;

            const row = document.createElement("tr");
            // Make the row clickable; clicking opens the product detail page
            row.className = "clickable-row";
            row.onclick = () => { window.location.href = `product-detail.html?id=${product.id}`; };

            row.innerHTML = `
                
                <td>${imageCell}</td>
                <td><strong>${product.name}</strong></td>
                <td>${product.categoryName}</td>
                <td>€${product.price.toFixed(2)}</td>
                <td>${stockBadge}</td>
                <td onclick="event.stopPropagation()">
                    <button class="btn btn-sm btn-primary me-1" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById("resultCount").textContent = `${products.length} results`;
}

function clearFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("categoryFilter").value = "all";
    document.getElementById("stockFilter").value = "all";
    document.getElementById("priceMin").value = "";
    document.getElementById("priceMax").value = "";
    fetchProducts();
}

function loadCategoryOptions() {
    fetch('api/categories')
        .then(response => response.json())
        .then(data => {
            const formSelect = document.getElementById("categoryId");
            formSelect.querySelectorAll("option:not([disabled])").forEach(o => o.remove());
            data.forEach(c => {
                if (c.active) {
                    const o = document.createElement("option");
                    o.value = c.id;
                    o.textContent = c.name;
                    formSelect.appendChild(o);
                }
            });

            const filterSelect = document.getElementById("categoryFilter");
            filterSelect.querySelectorAll("option:not([value='all'])").forEach(o => o.remove());
            data.forEach(c => {
                const o = document.createElement("option");
                o.value = c.id;
                o.textContent = c.name;
                filterSelect.appendChild(o);
            });
        })
        .catch(error => console.error("Error fetching categories:", error));
}

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

            const imagePreview = document.getElementById("imagePreview");
            if (product.image) {
                imagePreview.src = product.image;
                imagePreview.classList.remove("d-none");
            } else {
                imagePreview.classList.add("d-none");
            }

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