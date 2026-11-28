"use strict";

let analyticsData = null;

const STATUS_LABELS = {
    submitted: "Submitted",
    under_review: "Under Review",
    processing: "Processing",
    ready_for_pickup: "Ready for Pickup",
    released: "Released",
    rejected: "Rejected",
    cancelled: "Cancelled",
    on_hold: "On Hold"
};

function numberValue(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value) {
    return numberValue(value).toLocaleString("en-PH");
}

function formatCurrency(value) {
    return numberValue(value).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP"
    });
}

function safeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function showMessage(message, isError = false) {
    const element = document.getElementById("analyticsMessage");
    element.textContent = message;
    element.classList.toggle("error", isError);
    element.hidden = false;
}

function hideMessage() {
    document.getElementById("analyticsMessage").hidden = true;
}

function renderTotals(totals) {
    const activeQueue =
        numberValue(totals.submitted) +
        numberValue(totals.under_review) +
        numberValue(totals.processing) +
        numberValue(totals.ready_for_pickup);

    document.getElementById("totalRequests").textContent =
        formatNumber(totals.total_requests);

    document.getElementById("totalFees").textContent =
        formatCurrency(totals.total_fees);

    document.getElementById("releasedRequests").textContent =
        formatNumber(totals.released);

    document.getElementById("activeRequests").textContent =
        formatNumber(activeQueue);
}

function renderStatuses(totals) {
    const container = document.getElementById("statusBreakdown");

    container.innerHTML = Object.entries(STATUS_LABELS).map(([key, label]) => {
        const count = numberValue(totals[key]);

        return `
            <div style="display:flex;justify-content:space-between;gap:12px;
                        padding:11px 0;border-bottom:1px solid #e4ece2;">
                <span style="font-size:12px;">${safeText(label)}</span>
                <strong style="font-size:12px;">${formatNumber(count)}</strong>
            </div>
        `;
    }).join("");
}

function renderUsersByRole(rows) {
    const container = document.getElementById("usersByRole");

    if (!Array.isArray(rows) || rows.length === 0) {
        container.innerHTML = '<div class="admin-empty">No account records found.</div>';
        return;
    }

    container.innerHTML = rows.map(row => `
        <div style="display:flex;justify-content:space-between;gap:12px;
                    padding:13px 0;border-bottom:1px solid #e4ece2;">
            <span style="font-size:12px;">${safeText(row.role_name)}</span>
            <strong style="font-size:12px;">${formatNumber(row.total_users)}</strong>
        </div>
    `).join("");
}

function renderMonthlyActivity(rows) {
    const body = document.getElementById("monthlyActivity");

    if (!Array.isArray(rows) || rows.length === 0) {
        body.innerHTML = '<tr><td colspan="3" class="admin-empty">No monthly request records found.</td></tr>';
        return;
    }

    body.innerHTML = rows.map(row => `
        <tr>
            <td>${safeText(row.month)}</td>
            <td>${formatNumber(row.request_count)}</td>
            <td>${formatNumber(row.released_count)}</td>
        </tr>
    `).join("");
}

function renderPopularDocuments(rows) {
    const body = document.getElementById("popularDocuments");

    if (!Array.isArray(rows) || rows.length === 0) {
        body.innerHTML = '<tr><td colspan="2" class="admin-empty">No document request records found.</td></tr>';
        return;
    }

    body.innerHTML = rows.map(row => `
        <tr>
            <td>${safeText(row.document_name)}</td>
            <td>${formatNumber(row.request_count)}</td>
        </tr>
    `).join("");
}

async function loadAnalytics() {
    try {
        const response = await fetch("/admin/api/analytics", {
            method: "GET",
            credentials: "same-origin",
            headers: { "Accept": "application/json" }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load analytics.");
        }

        const data = result.analytics;

        if (!data || !data.totals) {
            throw new Error("The analytics response is incomplete.");
        }

        analyticsData = data;

        renderTotals(data.totals);
        renderStatuses(data.totals);
        renderUsersByRole(data.users_by_role);
        renderMonthlyActivity(data.monthly_requests);
        renderPopularDocuments(data.popular_documents);

        hideMessage();

    } catch (error) {
        console.error("Analytics loading error:", error);
        showMessage(error.message || "Unable to connect to the analytics service.", true);
    }
}

function csvCell(value) {
    const text = String(value ?? "");
    return '"' + text.replace(/"/g, '""') + '"';
}

function downloadCSV(filename, rows) {
    const csv = rows.map(row => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function exportAnalytics() {
    if (!analyticsData) {
        showMessage("There is no analytics data available to export.", true);
        return;
    }

    const rows = [["RegiTrack Analytics Report"], []];

    rows.push(["Request Summary"]);
    rows.push(["Metric", "Value"]);

    Object.entries({
        "Total Requests": analyticsData.totals.total_requests,
        "Total Fees (PHP)": analyticsData.totals.total_fees,
        "Released Requests": analyticsData.totals.released
    }).forEach(([label, value]) => rows.push([label, value]));

    rows.push([]);
    rows.push(["Request Status", "Count"]);

    Object.entries(STATUS_LABELS).forEach(([key, label]) => {
        rows.push([label, analyticsData.totals[key]]);
    });

    rows.push([]);
    rows.push(["Monthly Activity"]);
    rows.push(["Month", "Requests", "Released"]);

    (analyticsData.monthly_requests || []).forEach(row => {
        rows.push([row.month, row.request_count, row.released_count]);
    });

    rows.push([]);
    rows.push(["Popular Documents"]);
    rows.push(["Document", "Request Count"]);

    (analyticsData.popular_documents || []).forEach(row => {
        rows.push([row.document_name, row.request_count]);
    });

    rows.push([]);
    rows.push(["Users by Role"]);
    rows.push(["Role", "Total Users"]);

    (analyticsData.users_by_role || []).forEach(row => {
        rows.push([row.role_name, row.total_users]);
    });

    downloadCSV("regitrack-analytics-report.csv", rows);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("exportAnalytics")
        .addEventListener("click", exportAnalytics);

    loadAnalytics();
});
