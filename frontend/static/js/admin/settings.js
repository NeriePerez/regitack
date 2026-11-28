"use strict";

const settingsElements = {
    message: document.getElementById("settingsMessage"),
    loading: document.getElementById("settingsLoading"),
    form: document.getElementById("settingsForm"),
    systemName: document.getElementById("systemName"),
    preference: document.getElementById("processingPreference"),
    demoMode: document.getElementById("demoMode"),
    qrValidity: document.getElementById("qrValidity"),
    updatedAt: document.getElementById("settingsUpdatedAt"),
    refresh: document.getElementById("refreshSettingsButton"),
    reload: document.getElementById("reloadSettingsButton"),
    save: document.getElementById("saveSettingsButton")
};

const settingFields = {
    system_name: settingsElements.systemName,
    default_processing_preference: settingsElements.preference,
    demo_mode: settingsElements.demoMode,
    qr_token_validity_days: settingsElements.qrValidity
};

function showSettingsMessage(message, isError = false) {
    settingsElements.message.textContent = message;
    settingsElements.message.hidden = !message;
    settingsElements.message.classList.toggle("error", isError);
}

async function settingsRequest(url, options = {}) {
    const response = await fetch(url, {
        credentials: "same-origin",
        ...options
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Settings request failed.");
    }

    return result;
}

async function loadSettings() {
    settingsElements.loading.hidden = false;
    settingsElements.loading.textContent = "Loading system settings...";
    settingsElements.form.hidden = true;
    settingsElements.refresh.disabled = true;
    showSettingsMessage("");

    try {
        const result = await settingsRequest("/admin/api/settings");
        const settings = {};

        result.settings.forEach(item => {
            settings[item.setting_key] = item;
        });

        Object.entries(settingFields).forEach(([key, field]) => {
            if (settings[key]) {
                field.value = settings[key].setting_value;
            }
        });

        const dates = result.settings
            .map(item => item.updated_at)
            .filter(Boolean)
            .map(value => new Date(value))
            .filter(date => !Number.isNaN(date.getTime()));

        if (dates.length) {
            const latest = new Date(
                Math.max(...dates.map(date => date.getTime()))
            );

            settingsElements.updatedAt.textContent =
                "Latest setting update: " +
                latest.toLocaleString("en-PH");
        } else {
            settingsElements.updatedAt.textContent =
                "No update timestamps available.";
        }

        settingsElements.loading.hidden = true;
        settingsElements.form.hidden = false;
    } catch (error) {
        settingsElements.loading.textContent =
            "Unable to load system settings.";
        showSettingsMessage(error.message, true);
    } finally {
        settingsElements.refresh.disabled = false;
    }
}

async function saveSettings(event) {
    event.preventDefault();

    const values = {
        system_name: settingsElements.systemName.value.trim(),
        default_processing_preference: settingsElements.preference.value,
        demo_mode: settingsElements.demoMode.value,
        qr_token_validity_days: settingsElements.qrValidity.value
    };

    if (!values.system_name || values.system_name.length > 100) {
        showSettingsMessage(
            "System name is required and must not exceed 100 characters.",
            true
        );
        return;
    }

    const qrDays = Number(values.qr_token_validity_days);

    if (!Number.isInteger(qrDays) || qrDays < 1 || qrDays > 30) {
        showSettingsMessage(
            "QR token validity must be a whole number from 1 to 30.",
            true
        );
        return;
    }

    settingsElements.save.disabled = true;
    settingsElements.save.textContent = "Saving...";
    showSettingsMessage("");

    try {
        for (const [key, value] of Object.entries(values)) {
            await settingsRequest(`/admin/api/settings/${key}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ setting_value: value })
            });
        }

        showSettingsMessage("System settings saved successfully.");
        await loadSettings();
    } catch (error) {
        showSettingsMessage(
            error.message || "Unable to save system settings.",
            true
        );
    } finally {
        settingsElements.save.disabled = false;
        settingsElements.save.textContent = "Save Settings";
    }
}

settingsElements.form.addEventListener("submit", saveSettings);
settingsElements.refresh.addEventListener("click", loadSettings);
settingsElements.reload.addEventListener("click", loadSettings);

loadSettings();
