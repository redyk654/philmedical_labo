export const getRequest = async (url) => {
    const response = await fetch(url);
    if (response) {
        return await response.json();
    }
}