// Function to fix image paths based on environment
function fixImagePaths() {
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePath = isGitHubPages ? '/RadicalArt_2/' : '/';
    
    // Get all images
    const images = document.getElementsByTagName('img');
    
    for (let img of images) {
        let src = img.getAttribute('src');
        if (!src) continue;
        
        // If src already starts with http/https, leave it as is
        if (src.startsWith('http://') || src.startsWith('https://')) {
            continue;
        }
        
        // Store original source for error handling
        img.setAttribute('data-original-src', src);
        
        // Remove any leading slashes
        src = src.replace(/^\/+/, '');
        
        // If on GitHub Pages, prepend the repo name
        if (isGitHubPages) {
            img.src = `${basePath}${src}`;
        } else {
            // For local development, try different paths if image not found
            img.onerror = function() {
                const originalSrc = this.getAttribute('data-original-src');
                if (!originalSrc) return;
                
                const filename = originalSrc.split('/').pop();
                const pathParts = originalSrc.split('/');
                
                // Build array of paths to try
                const pathsToTry = [];
                
                // Try original path first
                pathsToTry.push(originalSrc);
                
                // Try with common parent directories
                const commonDirs = ['things', 'process', 'jpg', 'gif', 'images'];
                commonDirs.forEach(dir => {
                    pathsToTry.push(`${dir}/${filename}`);
                });
                
                // Try artist-specific directories if filename contains artist name
                const artistDirs = {
                    'Luther': 'luther',
                    'Beuys': 'Beuys',
                    'Serra': 'Serra',
                    'Klein': 'Klein',
                    'Geers': 'Geers',
                    'Chamberlain': 'JohnChamberlain',
                    'Arman': 'arman',
                    'Stelarc': 'stelarc',
                    'Ortiz': 'ortiz'
                };
                
                Object.entries(artistDirs).forEach(([artist, dir]) => {
                    if (filename.includes(artist)) {
                        pathsToTry.push(`${dir}/${filename}`);
                    }
                });
                
                // Try nested paths based on original path parts
                for (let i = pathParts.length - 1; i >= 0; i--) {
                    const nestedPath = pathParts.slice(i).join('/');
                    if (nestedPath !== filename) {
                        pathsToTry.push(nestedPath);
                    }
                }
                
                // Function to try loading image from a path
                const tryPath = (path) => {
                    return new Promise((resolve) => {
                        const testImg = new Image();
                        testImg.onload = () => resolve(true);
                        testImg.onerror = () => resolve(false);
                        testImg.src = `${basePath}${path}`;
                    });
                };
                
                // Try each path in sequence
                (async () => {
                    for (const path of pathsToTry) {
                        const success = await tryPath(path);
                        if (success) {
                            this.src = `${basePath}${path}`;
                            return;
                        }
                    }
                    
                    // If all paths fail, replace with placeholder
                    console.warn(`Failed to load image: ${filename}`);
                    const placeholder = document.createElement('div');
                    placeholder.className = 'broken-image';
                    placeholder.textContent = `Image not found: ${filename}`;
                    this.parentNode.replaceChild(placeholder, this);
                })();
            };
            
            // Trigger initial load
            img.src = `${basePath}${src}`;
        }
    }
}

// Add styles for broken images
const style = document.createElement('style');
style.textContent = `
    .broken-image {
        display: inline-block;
        background: #f0f0f0;
        border: 1px dashed #999;
        padding: 10px;
        color: #666;
        font-style: italic;
        font-size: 12px;
        text-align: center;
        min-width: 100px;
        min-height: 50px;
        line-height: 50px;
        margin: 5px;
    }
`;
document.head.appendChild(style);

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', fixImagePaths); 