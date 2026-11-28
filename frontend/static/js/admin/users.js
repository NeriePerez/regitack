"use strict";

let usersData = [];
let rolesData = [];
let searchTimeout = null;

const USERS_API = "/admin/api/users";
const ROLES_API = "/admin/api/roles";

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function showUsersMessage(message, isError = false) {
    const element = document.getElementById("usersMessage");
    element.textContent = message;
    element.classList.toggle("error", isError);
    element.hidden = false;
}

function hideUsersMessage() {
    const element = document.getElementById("usersMessage");
    element.hidden = true;
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        credentials: "same-origin",
        ...options,
        headers: {
            "Accept": "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        }
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "The request could not be completed.");
    }

    return result;
}

function formatDate(value) {
    if (!value) return "Never";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function renderRoles() {
    const roleFilter = document.getElementById("roleFilter");
    const userRole = document.getElementById("userRole");

    roleFilter.innerHTML = '<option value="">All roles</option>';
    userRole.innerHTML = "";

    rolesData.forEach(role => {
        const name = role.role_name;

        roleFilter.add(new Option(name, name));
        userRole.add(new Option(name, name));
    });

    const rolesList = document.getElementById("rolesList");

    if (!rolesData.length) {
        rolesList.textContent = "No roles are available.";
        return;
    }

    rolesList.innerHTML = rolesData.map(role => `
        <div style="padding:13px 0;border-bottom:1px solid #e4ece2;">
            <strong style="font-size:13px;">${escapeHTML(role.role_name)}</strong>
            <p class="admin-subtitle" style="margin-top:5px;">
                ${escapeHTML(role.description || "No description provided.")}
            </p>
        </div>
    `).join("");
}

function renderUsers() {
    const body = document.getElementById("usersTableBody");

    document.getElementById("usersCount").textContent =
        `${usersData.length.toLocaleString("en-PH")} account(s) found.`;

    if (!usersData.length) {
        body.innerHTML = `
            <tr>
                <td colspan="6" class="admin-empty">No matching users found.</td>
            </tr>
        `;
        return;
    }

    body.innerHTML = usersData.map(user => {
        const statusClass = String(user.account_status || "")
            .toLowerCase();

        return `
            <tr>
                <td>
                    <strong>${escapeHTML(user.full_name)}</strong>
                    <div class="admin-subtitle">${escapeHTML(user.email)}</div>
                    <div class="admin-subtitle">ID: ${escapeHTML(user.user_id)}</div>
                </td>
                <td>${escapeHTML(user.role_name)}</td>
                <td>
                    <span class="admin-status ${escapeHTML(statusClass)}">
                        ${escapeHTML(user.account_status)}
                    </span>
                </td>
                <td>${escapeHTML(formatDate(user.last_login))}</td>
                <td>${escapeHTML(formatDate(user.created_at))}</td>
                <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="admin-button secondary"
                                type="button"
                                data-action="edit"
                                data-id="${escapeHTML(user.user_id)}">
                            Edit
                        </button>
                        <button class="admin-button secondary"
                                type="button"
                                data-action="reset"
                                data-id="${escapeHTML(user.user_id)}">
                            Reset Password
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

async function loadUsers() {
    const params = new URLSearchParams();

    const search = document.getElementById("userSearch").value.trim();
    const role = document.getElementById("roleFilter").value;
    const status = document.getElementById("statusFilter").value;

    if (search) params.set("search", search);
    if (role) params.set("role", role);
    if (status) params.set("status", status);

    const body = document.getElementById("usersTableBody");
    body.innerHTML = `
        <tr><td colspan="6" class="admin-empty">Loading users...</td></tr>
    `;

    try {
        const result = await apiRequest(
            `${USERS_API}?${params.toString()}`
        );

        usersData = Array.isArray(result.users) ? result.users : [];
        renderUsers();
        hideUsersMessage();

    } catch (error) {
        console.error("User loading error:", error);
        body.innerHTML = `
            <tr><td colspan="6" class="admin-empty">Unable to load users.</td></tr>
        `;
        showUsersMessage(error.message, true);
    }
}

async function loadRoles() {
    try {
        const result = await apiRequest(ROLES_API);
        rolesData = Array.isArray(result.roles) ? result.roles : [];
        renderRoles();

    } catch (error) {
        console.error("Role loading error:", error);
        document.getElementById("rolesList").textContent =
            "Unable to load available roles.";
        showUsersMessage(error.message, true);
    }
}

function closeUserForm() {
    document.getElementById("userFormPanel").hidden = true;
    document.getElementById("userForm").reset();
    document.getElementById("editUserId").value = "";
}

function openAddUserForm() {
    document.getElementById("userForm").reset();
    document.getElementById("editUserId").value = "";

    document.getElementById("userFormTitle").textContent = "Add User";
    document.getElementById("userFormSubtitle").textContent =
        "Create a new system account.";
    document.getElementById("passwordField").hidden = false;
    document.getElementById("accountStatusField").hidden = true;
    document.getElementById("temporaryPassword").required = true;

    document.getElementById("userFormPanel").hidden = false;
    document.getElementById("resetPasswordPanel").hidden = true;

    document.getElementById("userFormPanel").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function openEditUserForm(userId) {
    const user = usersData.find(
        item => String(item.user_id) === String(userId)
    );

    if (!user) {
        showUsersMessage("The selected user could not be found.", true);
        return;
    }

    document.getElementById("userForm").reset();
    document.getElementById("editUserId").value = user.user_id;
    document.getElementById("fullName").value = user.full_name || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("userRole").value = user.role_name || "";
    document.getElementById("accountStatus").value =
        user.account_status || "Active";

    document.getElementById("userFormTitle").textContent = "Edit User";
    document.getElementById("userFormSubtitle").textContent =
        `Update account details for ${user.full_name}.`;
    document.getElementById("passwordField").hidden = true;
    document.getElementById("accountStatusField").hidden = false;
    document.getElementById("temporaryPassword").required = false;

    document.getElementById("userFormPanel").hidden = false;
    document.getElementById("resetPasswordPanel").hidden = true;

    document.getElementById("userFormPanel").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function openResetPasswordForm(userId) {
    const user = usersData.find(
        item => String(item.user_id) === String(userId)
    );

    if (!user) {
        showUsersMessage("The selected user could not be found.", true);
        return;
    }

    document.getElementById("resetPasswordForm").reset();
    document.getElementById("resetUserId").value = user.user_id;
    document.getElementById("resetPasswordDescription").textContent =
        `Set a new temporary password for ${user.full_name}.`;

    document.getElementById("userFormPanel").hidden = true;
    document.getElementById("resetPasswordPanel").hidden = false;

    document.getElementById("resetPasswordPanel").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

async function saveUser(event) {
    event.preventDefault();
    hideUsersMessage();

    const userId = document.getElementById("editUserId").value;
    const payload = {
        full_name: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        role: document.getElementById("userRole").value
    };

    if (userId) {
        payload.account_status =
            document.getElementById("accountStatus").value;
    } else {
        payload.password =
            document.getElementById("temporaryPassword").value;
    }

    const button = document.getElementById("saveUserButton");
    button.disabled = true;
    button.textContent = "Saving...";

    try {
        const result = await apiRequest(
            userId ? `${USERS_API}/${encodeURIComponent(userId)}` : USERS_API,
            {
                method: userId ? "PUT" : "POST",
                body: JSON.stringify(payload)
            }
        );

        closeUserForm();

        showUsersMessage(
            userId
                ? "User account updated successfully."
                : "New user account created successfully."
        );

        await loadUsers();

    } catch (error) {
        showUsersMessage(error.message, true);

    } finally {
        button.disabled = false;
        button.textContent = "Save User";
    }
}

async function resetUserPassword(event) {
    event.preventDefault();
    hideUsersMessage();

    const userId = document.getElementById("resetUserId").value;
    const newPassword = document.getElementById("newPassword").value;

    if (newPassword.length < 8) {
        showUsersMessage(
            "The new password must contain at least eight characters.",
            true
        );
        return;
    }

    if (!window.confirm("Reset the password for this user?")) {
        return;
    }

    try {
        await apiRequest(
            `${USERS_API}/${encodeURIComponent(userId)}/reset-password`,
            {
                method: "POST",
                body: JSON.stringify({ new_password: newPassword })
            }
        );

        document.getElementById("resetPasswordForm").reset();
        document.getElementById("resetPasswordPanel").hidden = true;

        showUsersMessage("User password reset successfully.");

    } catch (error) {
        showUsersMessage(error.message, true);
    }
}

function clearFilters() {
    document.getElementById("userSearch").value = "";
    document.getElementById("roleFilter").value = "";
    document.getElementById("statusFilter").value = "";
    loadUsers();
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addUserButton")
        .addEventListener("click", openAddUserForm);

    document.getElementById("closeUserForm")
        .addEventListener("click", closeUserForm);

    document.getElementById("cancelUserForm")
        .addEventListener("click", closeUserForm);

    document.getElementById("userForm")
        .addEventListener("submit", saveUser);

    document.getElementById("resetPasswordForm")
        .addEventListener("submit", resetUserPassword);

    document.getElementById("cancelResetPassword")
        .addEventListener("click", () => {
            document.getElementById("resetPasswordPanel").hidden = true;
            document.getElementById("resetPasswordForm").reset();
        });

    document.getElementById("clearFilters")
        .addEventListener("click", clearFilters);

    document.getElementById("userSearch")
        .addEventListener("input", () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(loadUsers, 300);
        });

    document.getElementById("roleFilter")
        .addEventListener("change", loadUsers);

    document.getElementById("statusFilter")
        .addEventListener("change", loadUsers);

    document.getElementById("usersTableBody")
        .addEventListener("click", event => {
            const button = event.target.closest("button[data-action]");
            if (!button) return;

            const userId = button.dataset.id;

            if (button.dataset.action === "edit") {
                openEditUserForm(userId);
            }

            if (button.dataset.action === "reset") {
                openResetPasswordForm(userId);
            }
        });

    loadRoles();
    loadUsers();
});
