document.addEventListener("DOMContentLoaded", function () {
    const apiUrl    = 'https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/halls'; // Changed
    const createUrl = 'https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/createHall';
    const updateUrl = 'https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/halls';
    const deleteUrl = 'https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/halls';
    const addHallForm = document.getElementById("addHallForm");
    const addHallButton = document.getElementById("addHallButton");
    const addHallFormContainer = document.getElementById("addHallFormContainer");
    const cancelAdd = document.getElementById("cancelAdd");
    const hallsContainer = document.getElementById("hallsContainer");
    const cityFilter = document.getElementById("cityFilter");
    const modal = document.getElementById("modal");
    const modalImage = document.getElementById("modalImage");
    const modalGallery = document.getElementById("modalGallery");
    const closeModal = document.getElementsByClassName("close")[0];
    const editRow = document.getElementById("editRow");
    const editHallForm = document.getElementById("editHallForm");
    const cancelEdit = document.getElementById("cancelEdit");
    
    let allHalls = [];

    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    // Open and close add hall form
    addHallButton.addEventListener("click", function () {
        addHallFormContainer.style.display = "block";
    });

    cancelAdd.addEventListener("click", function () {
        addHallFormContainer.style.display = "none";
        addHallForm.reset();
    });

    // Update city filter dynamically
    function updateCityFilter(cities) {
        // Clear existing city options
        cityFilter.innerHTML = '<option value="">הכל</option>'; // Add default option

        // Add unique cities to the dropdown
        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            cityFilter.appendChild(option);
        });
    }

    // Get unique cities from all halls
    function getUniqueCities(halls) {
        console.log(halls);
        const cities = halls.map(hall => hall.city);
        const uniqueCities = [...new Set(cities)]; // Get only unique cities
        return uniqueCities;
    }

    async function fetchAndDisplayHalls() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`An error occurred: ${response.statusText}`);
            }
            allHalls = await response.json();
            allHalls = allHalls['data']; // Changed
            console.log(allHalls);       // Changed

            
            hallsContainer.innerHTML = ''; // Clear the existing content before adding new halls

            // Update city filter based on fetched halls
            const uniqueCities = getUniqueCities(allHalls);
            updateCityFilter(uniqueCities);
    
            // Loop through the halls and create a card for each
            allHalls.forEach(hall => {
                const hallCard = document.createElement("div");
                hallCard.className = "hall";
    
                // Make sure the image is valid before displaying
                const imageSrc = hall.image1 ? `data:image/jpeg;base64,${hall.image1}` : 'defaultImage.jpg';
                hallCard.innerHTML = `
                    <img src="${imageSrc}" alt="${hall.name}" data-serial="${hall.serial_number}">
                    <h3>${hall.name}</h3>
                    <p>כתובת: ${hall.address}</p>
                    <p>כמות אורחים מירבית: ${hall.capacity}</p>
                    <p>ייעוד: ${hall.purpose}</p>
                    <p>מחיר לאורח: ${hall.pricePerGuest} ש"ח</p>
                    <div class="button-container">
                        <button class="edit-button">ערוך</button>
                        <button class="delete-button">מחק</button>
                    </div>
                `;
                
                hallCard.dataset.image1 = hall.image1;
                hallCard.dataset.image2 = hall.image2;
                hallCard.dataset.image3 = hall.image3;
                hallCard.dataset.image4 = hall.image4;
                hallCard.dataset.image5 = hall.image5;

                hallsContainer.appendChild(hallCard);
    
                // Add event listener for the edit button
                hallCard.querySelector(".edit-button").addEventListener("click", () => openEditRow(hall.serial_number));

                // Add event listener for the delete button
                hallCard.querySelector(".delete-button").addEventListener("click", () => deleteHall(hall.serial_number));
            });
        } catch (error) {
            console.error('Error fetching halls data:', error);
            hallsContainer.innerHTML = '<p>לא ניתן לטעון את המידע</p>';
        }
    }

    // Function to open the gallery modal
    function createGallery(images) {
        modalGallery.innerHTML = "";
        images.forEach((imgSrc, index) => {
            if (imgSrc) { // Display only images that exist
                const img = document.createElement("img");
                img.src = `data:image/jpeg;base64,${imgSrc}`;
                img.alt = `תמונה ${index + 1}`;
                img.className = "modal-thumbnail";
                img.onclick = function () {
                    modalImage.src = img.src; // Change the main image when clicking a thumbnail
                };
                modalGallery.appendChild(img);
            }
        });
    }

    function openModal(imageSrc, additionalImages) {
        modal.style.display = "flex";
        modalImage.src = imageSrc ? `data:image/jpeg;base64,${imageSrc}` : 'defaultImage.jpg';
        createGallery(additionalImages);
    }

    hallsContainer.addEventListener("click", function (event) {
        if (event.target.tagName === "IMG") {
            const hallElement = event.target.closest(".hall");
            const hallImages = [
                hallElement.dataset.image1,
                hallElement.dataset.image2,
                hallElement.dataset.image3,
                hallElement.dataset.image4,
                hallElement.dataset.image5
            ].filter(img => img); // Filter out empty or non-existent images
            openModal(hallImages[0], hallImages);
        }
    });

    if (closeModal) {
        closeModal.onclick = function () {
            modal.style.display = "none";
        };
    }

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Open edit row
    function openEditRow(serial_number) {
        const hall = allHalls.find(h => h.serial_number === serial_number);
        if (hall) {
            document.getElementById("editSerialNumber").value = hall.serial_number;
            document.getElementById("editName").value = hall.name;
            document.getElementById("editAddress").value = hall.address;
            document.getElementById("editCity").value = hall.city;
            document.getElementById("editCapacity").value = hall.capacity;
            document.getElementById("editPurpose").value = hall.purpose;
            document.getElementById("editPricePerGuest").value = hall.pricePerGuest;
            
            // Show the edit row
            editRow.style.display = "block";
        } else {
            console.error('Hall not found with serial number:', serial_number);
        }
    }

    // Close edit row
    function closeEditRow() {
        editRow.style.display = "none";
        editHallForm.reset();
    }

    cancelEdit.addEventListener("click", closeEditRow);

    // Update hall
    editHallForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        const serial_number = document.getElementById("editSerialNumber").value;
        const updatedHall = {
            serial_number: serial_number,
            name: document.getElementById("editName").value,
            address: document.getElementById("editAddress").value,
            city: document.getElementById("editCity").value,
            capacity: parseInt(document.getElementById("editCapacity").value, 10),
            purpose: document.getElementById("editPurpose").value,
            pricePerGuest: parseInt(document.getElementById("editPricePerGuest").value, 10)
        };

        try {
            // const response = await fetch(`${updateUrl}/${serial_number}`, {
            console.log(JSON.stringify(updatedHall));
            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedHall)
            });
            console.log(response);
            if (!response.ok) throw new Error('Error updating hall');
            alert('האולם עודכן בהצלחה');
            fetchAndDisplayHalls(); // Refresh the list to show updates
            closeEditRow(); // Close the edit row after submission
        } catch (error) {
            console.error('Error updating hall:', error);
            alert('שגיאה בעדכון האולם');
        }
    });

    // Delete hall
    async function deleteHall(serial_number) {
        if (confirm("האם אתה בטוח שברצונך למחוק את האולם?")) {
            try {
                const response = await fetch(`${deleteUrl}/${serial_number}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete hall');
                alert("האולם נמחק בהצלחה");
                fetchAndDisplayHalls();
            } catch (error) {
                console.error("Error deleting hall:", error);
                alert("שגיאה במחיקת האולם");
            }
        }
    }

    // Filter functionality
    function filterAndDisplayHalls() {
        const nameFilter = document.getElementById("nameFilter").value.toLowerCase();
        const cityFilterValue = cityFilter.value;
        const capacityFilter = parseInt(document.getElementById("capacityFilter").value, 10) || NaN;
        const purposeFilter = document.getElementById("purposeFilter").value;

        const filteredHalls = allHalls.filter(hall => {
            const matchesName = hall.name.toLowerCase().includes(nameFilter);
            const matchesCity = cityFilterValue === "" || hall.city === cityFilterValue;
            const matchesCapacity = isNaN(capacityFilter) || hall.capacity >= capacityFilter;
            const matchesPurpose = purposeFilter === "" || hall.purpose.includes(purposeFilter);
            return matchesName && matchesCity && matchesCapacity && matchesPurpose;
        });

        hallsContainer.innerHTML = ''; // Clear the existing content

        filteredHalls.forEach(hall => {
            const hallCard = document.createElement("div");
            hallCard.className = "hall";
            const imageSrc = hall.image1 ? `data:image/jpeg;base64,${hall.image1}` : 'defaultImage.jpg';
            hallCard.innerHTML = `
                <img src="${imageSrc}" alt="${hall.name}" data-serial="${hall.serial_number}">
                <h3>${hall.name}</h3>
                <p>כתובת: ${hall.address}</p>
                <p>כמות אורחים מירבית: ${hall.capacity}</p>
                <p>ייעוד: ${hall.purpose}</p>
                <p>מחיר לאורח: ${hall.pricePerGuest} ש"ח</p>
                <div class="button-container">
                    <button class="edit-button">ערוך</button>
                    <button class="delete-button">מחק</button>
                </div>
            `;
            hallCard.dataset.image1 = hall.image1;
            hallCard.dataset.image2 = hall.image2;
            hallCard.dataset.image3 = hall.image3;
            hallCard.dataset.image4 = hall.image4;
            hallCard.dataset.image5 = hall.image5;
            hallsContainer.appendChild(hallCard);

            hallCard.querySelector(".edit-button").addEventListener("click", () => openEditRow(hall.serial_number));
            hallCard.querySelector(".delete-button").addEventListener("click", () => deleteHall(hall.serial_number));
        });
    }

    // Add event listeners for filters
    document.getElementById("nameFilter").addEventListener("input", filterAndDisplayHalls);
    document.getElementById("cityFilter").addEventListener("change", filterAndDisplayHalls);
    document.getElementById("capacityFilter").addEventListener("input", filterAndDisplayHalls);
    document.getElementById("purposeFilter").addEventListener("change", filterAndDisplayHalls);

    // Add hall
    async function handleAddHallForm(event) {
        event.preventDefault();

        const formData = new FormData(addHallForm);
        const imageFiles = [
            document.getElementById("hallImage1").files[0],
            // document.getElementById("hallImage2").files[0],
            // document.getElementById("hallImage3").files[0],
            // document.getElementById("hallImage4").files[0],
            // document.getElementById("hallImage5").files[0],
        ];

        try {
            // Convert images to base64 and prepare the new hall data
            const base64Images = await Promise.all(imageFiles.map(toBase64));
            const newHall = {
                serial_number: allHalls.length ? Math.max(...allHalls.map(h => h.serial_number)) + 1 : 1,
                name: formData.get('name'),
                address: formData.get('address'),
                city: formData.get('city'),
                capacity: parseInt(formData.get('capacity'), 10),
                purpose: formData.get('purpose'),
                pricePerGuest: parseInt(formData.get('pricePerGuest'), 10),
                image1: base64Images[0],
                image2: base64Images[0],
                image3: base64Images[0],
                image4: base64Images[0],
                image5: base64Images[0]

                // image2: base64Images[1],
                // image3: base64Images[2],
                // image4: base64Images[3],
                // image5: base64Images[4]
            };
            
            console.log(JSON.stringify(newHall));
            const response = await fetch(createUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newHall)
            });
            console.log(response);
            if (!response.ok) {
                throw new Error(`An error occurred: ${response.statusText}`);
            }
            alert("האולם נוסף בהצלחה!");
            addHallForm.reset();
            addHallFormContainer.style.display = "none";
            fetchAndDisplayHalls();
        } catch (error) {
            console.error('Error adding hall:', error);
            alert("שגיאה בהוספת האולם.");
        }
    }

    addHallForm.addEventListener("submit", handleAddHallForm);

    fetchAndDisplayHalls();
});
