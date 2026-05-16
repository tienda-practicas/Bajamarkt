let searchDebounce = null;

document.addEventListener("DOMContentLoaded", () => {
    fetchCategories();

    document.getElementById("categoryForm").addEventListener("submit", saveCategory);
    document.getElementById("cancelBtn").addEventListener("click", resetForm);

    document.getElementById("searchInput").addEventListener("input", () => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(fetchCategories, 300);
    });
    document.getElementById("statusFilter").addEventListener("change", fetchCategories);
    document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);
});

function buildQueryString() {
    const search = document.getElementById("searchInput").value.trim();
    const status = document.getElementById("statusFilter").value;

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status && status !== "all") params.append("status", status);

    const query = params.toString();
    return query ? `?${query}` : "";
}

function fetchCategories() {
    fetch('api/categories' + buildQueryString())
        .then(response => response.json())
        .then(renderCategories)
        .catch(error => console.error("Error fetching categories:", error));
}

function formatDate(value) {
    if (!value) return '<span class="text-muted small">-</span>';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString('es-ES', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

function renderCategories(categories) {
    const tableBody = document.getElementById("categoryTableBody");
    tableBody.innerHTML = "";

    if (categories.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    No categories match your filters.
                </td>
            </tr>`;
    } else {
        categories.forEach(category => {
            const statusBadge = category.active
                ? '<span class="badge bg-success">Active</span>'
                : '<span class="badge bg-danger">Inactive</span>';

            const row = document.createElement("tr");
            // Make the row clickable; clicking opens the detail page
            row.className = "clickable-row";
            row.onclick = () => { window.location.href = `category-detail.html?id=${category.id}`; };

            row.innerHTML = `
                <td><strong>${category.name}</strong></td>
                <td>${category.description}</td>
                <td>${statusBadge}</td>
                <td><small>${formatDate(category.createdAt)}</small></td>
                <td onclick="event.stopPropagation()">
                    <button class="btn btn-sm btn-primary me-1" onclick="editCategory(${category.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById("resultCount").textContent = `${categories.length} results`;
}

function clearFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("statusFilter").value = "all";
    fetchCategories();
}

function saveCategory(event) {
    event.preventDefault();

    const id = document.getElementById("categoryId").value;
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const active = document.getElementById("isActive").checked;

    const category = { name, description, active };

    let method;
    if (id) {
        category.id = parseInt(id);
        method = "PUT";
    } else {
        method = "POST";
    }

    fetch('api/categories', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    })
        .then(response => {
            if (response.ok) {
                resetForm();
                fetchCategories();
            } else {
                alert(id ? "Error updating category" : "Error creating category");
            }
        })
        .catch(error => console.error("Error:", error));
}

function editCategory(id) {
    fetch(`api/categories?id=${id}`)
        .then(response => response.json())
        .then(category => {
            document.getElementById("categoryId").value = category.id;
            document.getElementById("name").value = category.name;
            document.getElementById("description").value = category.description;
            document.getElementById("isActive").checked = category.active;

            document.getElementById("formTitle").textContent = `Edit Category #${category.id}`;
            document.getElementById("submitBtn").textContent = "Update Category";
            document.getElementById("submitBtn").classList.remove("btn-success");
            document.getElementById("submitBtn").classList.add("btn-primary");
            document.getElementById("cancelBtn").classList.remove("d-none");

            window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch(error => console.error("Error loading category:", error));
}

function resetForm() {
    document.getElementById("categoryForm").reset();
    document.getElementById("categoryId").value = "";
    document.getElementById("formTitle").textContent = "Add New Category";
    document.getElementById("submitBtn").textContent = "Save Category";
    document.getElementById("submitBtn").classList.remove("btn-primary");
    document.getElementById("submitBtn").classList.add("btn-success");
    document.getElementById("cancelBtn").classList.add("d-none");
}

function deleteCategory(id) {
    if (confirm("Are you sure you want to delete this category?")) {
        fetch(`api/categories?id=${id}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    fetchCategories();
                } else {
                    alert("Error deleting category");
                }
            })
            .catch(error => console.error("Error:", error));
    }
}