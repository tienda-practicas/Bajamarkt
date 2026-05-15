document.addEventListener("DOMContentLoaded", () => {
    fetchCategories();

    const form = document.getElementById("categoryForm");
    form.addEventListener("submit", createCategory);
});

function fetchCategories() {
    fetch('api/categories')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("categoryTableBody");
            tableBody.innerHTML = ""; // Clear current table

            data.forEach(category => {
                const statusBadge = category.active
                    ? '<span class="badge bg-success">Active</span>'
                    : '<span class="badge bg-danger">Inactive</span>';

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${category.id}</td>
                    <td><strong>${category.name}</strong></td>
                    <td>${category.description}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching categories:", error));
}

function createCategory(event) {
    event.preventDefault(); // Prevent page reload

    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const active = document.getElementById("isActive").checked;

    // Field names must match the Java model (Category.java) so Gson can map them
    const newCategory = {
        name: name,
        description: description,
        brand: "",       // not in the form yet; send empty string
        active: active   // <-- was "isActive", which Gson ignored
    };

    fetch('api/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCategory)
    })
        .then(response => {
            if (response.ok) {
                document.getElementById("categoryForm").reset(); // Clear form
                fetchCategories(); // Reload table
            } else {
                alert("Error creating category");
            }
        })
        .catch(error => console.error("Error:", error));
}

function deleteCategory(id) {
    if (confirm("Are you sure you want to delete this category?")) {
        fetch(`api/categories?id=${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    fetchCategories(); // Reload table
                } else {
                    alert("Error deleting category");
                }
            })
            .catch(error => console.error("Error:", error));
    }
}