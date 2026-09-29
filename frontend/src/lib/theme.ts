export const THEME_STORAGE_KEY = "tf-theme";

// Выполняется в <head> до отрисовки, чтобы не было вспышки светлой темы
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
