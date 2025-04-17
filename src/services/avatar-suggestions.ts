const apiKey = process.env.UNSPLASH_API_KEY || '';
const apiUrl = 'https://api.unsplash.com/search/photos';

export const fetchAvatarSuggestions = async () => {
    try {
        const response = await fetch(`${apiUrl}?query=avatar&per_page=30&client_id=${apiKey}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract image URLs from the Unsplash API response
        const imageUrls = data.results.map((result: any) => result.urls.regular) || [];
        return imageUrls;

    } catch (error) {
        console.error("Error fetching avatar suggestions:", error);
        return []; // Return an empty array in case of an error
    }
};