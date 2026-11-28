"use strict";

let auditLogs = [];
let searchTimer = null;

const elements = {
    message: document.getElementById("logsMessage"),
    search: document.getElementById("logSearch"),
    action: document.getElementById("logActionFilter"),
    count: document.getElementById("logsCount"),
    table: document.getElementById("logsTableBody"),
    refresh: document.getElementById("refreshLogsButton"),
    export: document.getElementById("exportLogsButton")
};

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
    elements.message.textContent = message;
    elements.message.hidden = !message;
    elements.message.classList.toggle("error", isError);
}


function formatDate(value) {
    if (!value) return "—";

    const date = new Date(
        String(value).replace(" ", "T") + "+08:00"
    );

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat("en-PH", {
        timeZone: "Asia/Manila",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(date).replace(" at ", " · ");
}





function populateActionFilter(actions) {
    const selectedAction = elements.action.value;

    elements.action.innerHTML =
        '<option value="">All Action Types</option>';

    actions.forEach(action => {
        const option = document.createElement("option");

        option.value = action;
        option.textContent = action;

        elements.action.appendChild(option);
    });

    if (actions.includes(selectedAction)) {
        elements.action.value = selectedAction;
    }
}




async function loadAuditLogs() {
    const search = elements.search.value.trim();
    const action = elements.action.value;

    elements.count.textContent = "Loading audit records...";
    elements.table.innerHTML =
        '<tr><td colspan="5">Loading audit records...</td></tr>';

    try {
        const params = new URLSearchParams({ search, action });

        const response = await fetch(
            `/admin/api/audit-logs?${params.toString()}`,
            { credentials: "same-origin" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load audit logs.");
        }

        auditLogs = Array.isArray(result.logs) ? result.logs : [];

        populateActionFilter(
            Array.isArray(result.actions) ? result.actions : []
        );

        renderAuditLogs();

        showMessage("");
    } catch (error) {
        auditLogs = [];
        elements.count.textContent = "Unable to retrieve audit records.";
        elements.table.innerHTML =
            '<tr><td colspan="5">Failed to load audit records.</td></tr>';
        showMessage(error.message || "Connection error.", true);
    }
}

function renderAuditLogs() {
    elements.count.textContent =
        `${auditLogs.length} audit record(s) displayed`;

    if (auditLogs.length === 0) {
        elements.table.innerHTML =
            '<tr><td colspan="5">No audit records found.</td></tr>';
        return;
    }

    elements.table.innerHTML = auditLogs.map(log => `
        <tr>
            <td>${safeText(formatDate(log.created_at))}</td>
            <td>${safeText(log.actor_email || "System")}</td>
            <td>${safeText(log.action || "—")}</td>
            <td>${safeText(log.details || "—")}</td>
        </tr>
    `).join("");
}

function exportAuditLogs() {
    if (auditLogs.length === 0) {
        showMessage("There are no audit records to export.", true);
        return;
    }

    const columns = [
        "Audit ID",
        "User ID",
        "Actor Email",
        "Action",
        "Details",
        "IP Address",
        "Date & Time"
    ];

    const escapeCSV = value =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = auditLogs.map(log => [
        log.audit_id,
        log.user_id,
        log.actor_email,
        log.action,
        log.details,
        log.ip_address,
        log.created_at
    ]);

    const csv = [columns, ...rows]
        .map(row => row.map(escapeCSV).join(","))
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "regitrack-audit-logs.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showMessage("Audit log CSV export prepared.");
}

elements.search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadAuditLogs, 350);
});

elements.action.addEventListener("change", loadAuditLogs);
elements.export.addEventListener("click", exportAuditLogs);

loadAuditLogs();
