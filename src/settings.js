export const initSettingsPanel = (ids) => {
    return ids.map(([id, defaultValue]) => {
        const input = document.getElementById(id);
        const result = { input, value: defaultValue };
        input.onchange = (e) => {
            result.value = Number.parseFloat(e.target.value);
        };
        input.value = result.value;
        return result;
    });
};
