// /**
//  * Fetches the favicon URL for a given website.
//  * @param {string} siteUrl - The URL of the website.
//  * @returns {Promise<string | null>} - The URL of the favicon or null if not found.
//  */
// async function fetchFavicon(siteUrl: string): Promise<string | null> {
//     try {
//         // Normalize the URL to ensure it starts with http/https
//         const normalizedUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;

//         // Fetch the HTML content of the site
//         const response = await fetch(normalizedUrl);
//         const htmlText = await response.text();

//         // Create a DOM parser to extract the favicon link
//         const parser = new DOMParser();
//         const doc = parser.parseFromString(htmlText, "text/html");

//         // Attempt to find the favicon in the <link> tags
//         const iconLink = doc.querySelector("link[rel*='icon']");
        
//         if (iconLink) {
//             const faviconUrl = iconLink.getAttribute("href");
//             // If favicon URL is relative, convert it to absolute
//             if (faviconUrl && !faviconUrl.startsWith("http")) {
//                 return new URL(faviconUrl, normalizedUrl).toString();
//             }
//             return faviconUrl;
//         }

//         // If no favicon is found in the document, return the default favicon location
//         return `${normalizedUrl}/favicon.ico`;
//     } catch (error) {
//         console.error("Error fetching favicon:", error);
//         return null;
//     }
// }

// // Usage
// const siteData = [
//     {
//         id: "40",
//         url: "https://test.chethanspoojary1.com"
//     }
// ];

// // siteData.forEach(async (site) => {
// //     const faviconUrl = await fetchFavicon(site.url);
// //     console.log(`Favicon for ${site.url}: ${faviconUrl}`);
// // });
