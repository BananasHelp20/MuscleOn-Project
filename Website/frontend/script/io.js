/**
 * Downloads the user's defined exercises as a JSON file
 */
async function downloadExercises() {
    try {
        const response = await fetch("/api/downloadExercises");
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Download failed: ${response.status}`, errorText);
            throw new Error(`Failed to download exercises: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'userdefinedExercises.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error("Error downloading exercises:", error);
        alert("Failed to download exercises: " + error.message);
    }
}

/**
 * Uploads and imports exercises from a JSON file
 */
function uploadExercises() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const exercises = JSON.parse(text);
            
            if (!Array.isArray(exercises)) {
                throw new Error("Invalid file format: expected an array of exercises");
            }
            
            // Send exercises to backend
            const response = await fetch("/api/uploadExercises", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ exercises: exercises })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to upload exercises");
            }
            
            const result = await response.json();
            alert(`Successfully imported ${result.importedCount} exercises!`);
            
            // Reload the page to show the imported exercises
            window.location.reload();
        } catch (error) {
            console.error("Error uploading exercises:", error);
            alert("Failed to upload exercises: " + error.message);
        }
    });
    input.click();
}

// Attach event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById("downloadEx");
    const uploadBtn = document.getElementById("uploadEx");
    
    if (downloadBtn) {
        downloadBtn.addEventListener("click", downloadExercises);
    }
    
    if (uploadBtn) {
        uploadBtn.addEventListener("click", uploadExercises);
    }
});