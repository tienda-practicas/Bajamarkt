document.addEventListener("DOMContentLoaded", () => {
    fetchCategories();

    document.getElementById("categoryForm").addEventListener("submit", saveCategory);
    document.getElementById("cancelBtn").addEventListener("click", resetForm);
});

function fetchCategories() {
    fetch('api/categories')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("categoryTableBody");
            tableBody.innerHTML = "";

            data.forEach(category => {
                const statusBadge = category.active
                    ? '<span class="badge bg-success">Active</span>'
                    : '<span class="badge bg-danger">Inactive</span>';

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${category.id}</td>
                    <td><strong>${category.name}</strong></td>
                    <td>${category.description}</td>
                    <td>${category.brand || '<span class="text-muted small">-</span>'}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="editCategory(${category.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching categories:", error));
}

// Decides whether to POST (create) or PUT (update) based on whether the hidden ID is set
function saveCategory(event) {
    event.preventDefault();

    const id = document.getElementById("categoryId").value;
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const brand = document.getElementById("brand").value;
    const active = document.getElementById("isActive").checked;

    const category = {
        name: name,
        description: description,
        brand: brand,
        active: active
    };

    let method, url;
    if (id) {
        category.id = parseInt(id);
        method = "PUT";
        url = 'api/categories';
    } else {
        method = "POST";
        url = 'api/categories';
    }

    fetch(url, {
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

// Fetches the category by ID and fills the form with its data
function editCategory(id) {
    fetch(`api/categories?id=${id}`)
        .then(response => response.json())
        .then(category => {
            document.getElementById("categoryId").value = category.id;
            document.getElementById("name").value = category.name;
            document.getElementById("description").value = category.description;
            document.getElementById("brand").value = category.brand || "";
            document.getElementById("isActive").checked = category.active;

            // Switch UI to edit mode
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