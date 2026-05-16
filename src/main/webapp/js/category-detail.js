document.addEventListener("DOMContentLoaded", () => {
    // Read ?id=X from the URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        showError();
        return;
    }

    loadCategory(id);
});

function loadCategory(id) {
    // Fetch the category and its products in parallel
    Promise.all([
        fetch(`api/categories?id=${id}`).then(r => {
            if (!r.ok) throw new Error("Category not found");
            return r.json();
        }),
        fetch(`api/products?category=${id}`).then(r => r.json())
    ])
        .then(([category, products]) => renderDetail(category, products))
        .catch(err => {
            console.error(err);
            showError();
        });
}

function renderDetail(category, products) {
    document.getElementById("loadingState").classList.add("d-none");
    document.getElementById("detailContent").classList.remove("d-none");

    // Header
    document.getElementById("catId").textContent = category.id;
    document.getElementById("catName").textContent = category.name;
    document.getElementById("breadcrumbName").textContent = category.name;
    document.title = `${category.name} - Bajamarkt`;

    // Status badge in the header
    const statusBadge = category.active
        ? '<span class="badge bg-success">Active</span>'
        : '<span class="badge bg-danger">Inactive</span>';
    document.getElementById("catStatus").innerHTML = statusBadge;

    // Info card
    document.getElementById("catDescription").textContent = category.description;
    document.getElementById("catStatusText").innerHTML = statusBadge;
    document.getElementById("catCreatedAt").textContent = formatDate(category.createdAt);
    document.getElementById("catProductCount").textContent =
        `${products.length} ${products.length === 1 ? "product" : "products"}`;

    // Edit link points back to the listing page; we could deep-link if we built that
    document.getElementById("editBtn").href = `categories.html`;

    // Products list
    renderProducts(products);
}

function renderProducts(products) {
    const container = document.getElementById("productsList");
    document.getElementById("productCountBadge").textContent = products.length;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="mb-0">No products in this category yet.</p>
            </div>`;
        return;
    }

    container.innerHTML = products.map(p => {
        const img = p.image
            ? `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}"
                    onerror="this.style.visibility='hidden'">`
            : `<img src="data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%23dee2e6%22 width=%2240%22 height=%2240%22/></svg>" alt="">`;

        const stockText = p.stock === 0
            ? `<span class="text-danger">Out of stock</span>`
            : p.stock <= 10
                ? `<span class="text-warning">Low stock: ${p.stock}</span>`
                : `${p.stock} in stock`;

        return `
            <a href="product-detail.html?id=${p.id}" class="product-row">
                ${img}
                <div class="info">
                    <div class="name">${escapeHtml(p.name)}</div>
                    <div class="meta">${stockText}</div>
                </div>
                <div class="price">€${p.price.toFixed(2)}</div>
            </a>
        `;
    }).join("");
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function showError() {
    document.getElementById("loadingState").classList.add("d-none");
    document.getElementById("errorState").classList.remove("d-none");
}

// Tiny helpers to avoid breaking the page if a name/url contains < or "
function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function escapeAttr(s) {
    if (s == null) return "";
    return String(s).replace(/"/g, "&quot;");
}