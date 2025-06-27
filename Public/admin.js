const BASE_URL = "https://lynq-backend-nv5f.onrender.com";

async function loadApplicants() {
  const token = document.getElementById("adminToken").value;
  const tableBody = document.getElementById("applicantsTable");

  tableBody.innerHTML = "<tr><td colspan='7' class='p-4'>Loading...</td></tr>";

  try {
    const response = await fetch(`${BASE_URL}/admin/applicants`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const resText = await response.text();
    console.log("🔍 Server response:", resText);

    let data;
    try {
      data = JSON.parse(resText);
    } catch (err) {
      console.error("❌ Failed to parse JSON:", err.message);
      tableBody.innerHTML = `<tr><td colspan="7" class="p-4 text-red-400">❌ Server did not return valid JSON. Check token or backend logs.</td></tr>`;
      return;
    }

    // Check if data is an array
    if (!Array.isArray(data)) {
      tableBody.innerHTML = `<tr><td colspan="7" class="p-4 text-red-400">❌ Unexpected response structure.</td></tr>`;
      return;
    }

    // Clear previous
    tableBody.innerHTML = "";

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="p-4 text-yellow-400">No applicants yet.</td></tr>`;
      return;
    }

    data.forEach((applicant) => {
      const row = document.createElement("tr");
      row.className = "border-b border-gray-700";

      row.innerHTML = `
        <td class="p-2">${applicant.fullname}</td>
        <td class="p-2">${applicant.email}</td>
        <td class="p-2">${applicant.bio}</td>
        <td class="p-2">${applicant.social}</td>
        <td class="p-2">${applicant.category}</td>
        <td class="p-2">${applicant.status || "Pending"}</td>
        <td class="p-2 space-x-2">
          <button class="bg-green-600 px-2 py-1 rounded text-sm hover:bg-green-700">Approve</button>
          <button class="bg-red-600 px-2 py-1 rounded text-sm hover:bg-red-700">Reject</button>
        </td>
      `;

      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("❌ Error loading applicants:", error.message);
    tableBody.innerHTML = `<tr><td colspan="7" class="p-4 text-red-500">Failed to fetch applicants.</td></tr>`;
  }
}