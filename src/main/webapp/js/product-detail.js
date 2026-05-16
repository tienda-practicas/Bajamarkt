document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        showError();
        return;
    }

    loadProduct(id);
});

function loadProduct(id) {
    fetch(`api/products?id=${id}`)
        .then(r => {
            if (!r.ok) throw new Error("Product not found");
            return r.json();
        })
        .then(product => {
            // Once we have the product, fetch its category by id to display the name
            return fetch(`api/categories?id=${product.idCategory}`)
                .then(r => r.ok ? r.json() : null)
                .then(category => renderDetail(product, category));
        })
        .catch(err => {
            console.error(err);
            showError();
        });
}

function renderDetail(product, category) {
    document.getElementById("loadingState").classList.add("d-none");
    document.getElementById("detailContent").classList.remove("d-none");

    // Header / breadcrumb
    document.getElementById("prodId").textContent = product.id;
    document.getElementById("prodName").textContent = product.name;
    document.getElementById("breadcrumbName").textContent = product.name;
    document.title = `${product.name} - Bajamarkt`;

    // Image
    const img = document.getElementById("prodImage");
    img.src = product.image || "";
    img.alt = product.name;

    // Price
    document.getElementById("prodPrice").textContent = product.price.toFixed(2);

    // Stock — badge in the top corner + text in the info list
    const stockBadge = document.getElementById("prodStockBadge");
    const stockText = document.getElementById("prodStockText");

    if (product.stock === 0) {
        stockBadge.innerHTML = '<span class="badge bg-danger fs-6">Out of stock</span>';
        stockText.innerHTML = '<span class="text-danger fw-semibold">Out of stock</span>';
    } else if (product.stock <= 10) {
        stockBadge.innerHTML = `<span class="badge bg-warning text-dark fs-6">Low stock</span>`;
        stockText.innerHTML = `<span class="text-warning fw-semibold">${product.stock} units</span> <small class="text-muted">(low)</small>`;
    } else {
        stockBadge.innerHTML = `<span class="badge bg-success fs-6">In stock</span>`;
        stockText.textContent = `${product.stock} units`;
    }

    // Category link
    const catLink = document.getElementById("prodCategoryLink");
    if (category) {
        catLink.textContent = category.name;
        catLink.href = `category-detail.html?id=${category.id}`;
    } else {
        catLink.textContent = `Category #${product.idCategory}`;
        catLink.removeAttribute("href");
    }

    document.getElementById("editBtn").href = `products.html`;
}

function showError() {
    document.getElementById("loadingState").classList.add("d-none");
    document.getElementById("errorState").classList.remove("d-none");
}