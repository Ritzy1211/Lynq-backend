let currentPage = 1;
let totalPages = 1;
let allApplicants = [];

// Load applicants from server
async function loadApplicants() {
  const token = localStorage.getItem("adminToken");
  const statusMsg = document.getElementById("statusMsg");
  const applicantsTable = document.getElementById("applicantsTable");

  statusMsg.textContent = "Loading...";
  applicantsTable.innerHTML = "";

  try {
    const response = await fetch("/admin/applicants", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server did not return JSON");
    }

    const data = await response.json();
    console.log("Fetched applicants:", data);

    if (!Array.isArray(data)) {
      // If backend sends { applicants: [...] }
      if (Array.isArray(data.applicants)) {
        allApplicants = data.applicants;
      } else {
        throw new Error("Invalid response format");
      }
    } else {
      allApplicants = data;
    }

    totalPages = Math.ceil(allApplicants.length / 5);
    currentPage = 1;

    renderPage(currentPage);
    updatePageIndicator();
    statusMsg.textContent = "";
  } catch (err) {
    console.error("Failed to load applicants:", err.message);
    statusMsg.textContent = "Failed to load applicants.";
  }
}

// Render a specific page
function renderPage(page) {
  const applicantsTable = document.getElementById("applicantsTable");
  applicantsTable.innerHTML = "";

  const start = (page - 1) * 5;
  const end = start + 5;
  const applicants = allApplicants.slice(start, end);

  applicants.forEach((app) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border px-2 py-1">${app.fullname}</td>
      <td class="border px-2 py-1">${app.email}</td>
      <td class="border px-2 py-1">${app.bio}</td>
      <td class="border px-2 py-1">${app.social}</td>
      <td class="border px-2 py-1">${app.category}</td>
      <td class="border px-2 py-1">${app.status || "pending"}</td>
      <td class="border px-2 py-1 space-x-2">
        <button onclick="handleAction('${
          app._id
        }', 'approve')" class="bg-green-600 px-2 py-1 rounded">Approve</button>
        <button onclick="handleAction('${
          app._id
        }', 'reject')" class="bg-red-600 px-2 py-1 rounded">Reject</button>
      </td>
    `;
    applicantsTable.appendChild(row);
  });

  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage === totalPages;
}

function updatePageIndicator() {
  document.getElementById(
    "pageIndicator"
  ).textContent = `Page ${currentPage} of ${totalPages}`;
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    renderPage(currentPage);
    updatePageIndicator();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
    updatePageIndicator();
  }
}

// Handle approve/reject
async function handleAction(id, action) {
  const token = localStorage.getItem("adminToken");

  try {
    const res = await fetch(`/admin/applicants/${id}/${action}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Action failed");

    alert(data.message);
    loadApplicants(); // refresh
  } catch (err) {
    console.error(err);
    alert("Failed to update applicant status.");
  }
}

// Export CSV
function exportToCSV() {
  if (!allApplicants.length) return alert("No applicants to export");

  const headers = ["Full Name", "Email", "Bio", "Social", "Category", "Status"];
  const csvRows = [headers.join(",")];

  allApplicants.forEach((app) => {
    const row = [
      app.fullname,
      app.email,
      app.bio,
      app.social,
      app.category,
      app.status || "pending",
    ];
    csvRows.push(row.map((v) => `"${v}"`).join(","));
  });

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "lynq_applicants.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function filterByStatus(status) {
  const rows = document.querySelectorAll("#applicantsTable tr");

  rows.forEach((row) => {
    const statusCell = row.children[5]; // 6th column is status
    const value = statusCell.textContent.trim().toLowerCase();

    row.style.display = status === "all" || value === status ? "" : "none";
  });
}

// Logout
function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "/admin";
}

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "/admin";
    return;
  }

  loadApplicants();

  document.getElementById("fetchBtn")?.addEventListener("click", () => {
    loadApplicants();
  });

  document
    .getElementById("searchInput")
    ?.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      const rows = document.querySelectorAll("#applicantsTable tr");

      rows.forEach((row) => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
      });
    });
});
