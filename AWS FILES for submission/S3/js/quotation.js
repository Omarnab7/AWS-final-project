document.addEventListener("DOMContentLoaded", function() {
    const hallsSelect = document.getElementById("hallSelect");
    const foodSelect = document.getElementById("foodSelect");
    const quotationForm = document.getElementById("quotationForm");
    const quotationResult = document.getElementById("quotationResult");
    const submitQuotationButton = document.getElementById("submitQuotationButton");
    const quotationDetailsElement = document.getElementById("quotationDetails");
    const editQuotationContainer = document.getElementById("editQuotationContainer");
    const editQuotationForm = document.getElementById("editQuotationForm");
    const editHallSelect = document.getElementById("editHallSelect");
    const editFoodSelect = document.getElementById("editFoodSelect");

    const getQuotationButton = document.getElementById("getQuotationButton");
    const quotationFormContainer = document.getElementById("quotationFormContainer");
    const cancelQuotationButton = document.getElementById("cancelQuotationButton");

    let quotationData = {};
    let hallsList = [];
    let menusList = [];
    let quotations = [];

    // Toggle the quotation form visibility
    getQuotationButton.addEventListener("click", function() {
        quotationFormContainer.classList.remove("hidden");
    });

    cancelQuotationButton.addEventListener("click", function() {
        quotationFormContainer.classList.add("hidden");
        quotationForm.reset();
    });

    function populateEditFormSelects() {
        editHallSelect.innerHTML = hallsSelect.innerHTML;
        editFoodSelect.innerHTML = foodSelect.innerHTML;
    }
    
    function showEditForm() {
        editQuotationContainer.classList.remove("hidden");
        populateEditFormSelects();
    }
    
    function hideEditForm() {
        editQuotationContainer.classList.add("hidden");
        editQuotationForm.reset();
    }

    async function fetchHalls() {
        // const localHalls = localStorage.getItem('halls');
        // if (localHalls) {
        //     hallsList = JSON.parse(localHalls);
        //     populateHallsSelect(hallsList);
        // } else {
            await updateHallsFromServer();
        // }
    }

    async function updateHallsFromServer() {
        try {
            const response = await fetch('https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/halls');
            if (!response.ok) throw new Error('Failed to load halls');
            
            hallsList = await response.json();
            console.log(hallsList.data);
            //localStorage.setItem('halls', JSON.stringify(hallsList));
            populateHallsSelect(hallsList.data);
        } catch (error) {
            console.error('Error fetching halls:', error);
            hallsSelect.innerHTML = '<option value="">לא ניתן לטעון את המידע</option>';
        }
    }

    function populateHallsSelect(halls) {
        hallsSelect.innerHTML = '<option value="">-- בחר אולם --</option>';
        halls.forEach(hall => {
            const option = document.createElement("option");
            option.value = hall.serial_number;
            option.text = `${hall.name} - ${hall.pricePerGuest} ש"ח`;
            option.setAttribute("data-price", hall.pricePerGuest);
            hallsSelect.appendChild(option);
        });
    }

    async function fetchMenus() {
        // const localMenus = localStorage.getItem('menus');
        // if (localMenus) {
        //     menusList = JSON.parse(localMenus);
        //     populateMenusSelect(menusList);
        // } else {
            await updateMenusFromServer();
        //}
    }

    async function updateMenusFromServer() {
        try {
            const response = await fetch('https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/menu');
            if (!response.ok) throw new Error('Failed to load menus');
            
            menusList = await response.json();
            menusList = menusList.data;
            localStorage.setItem('menus', JSON.stringify(menusList));
            populateMenusSelect(menusList);
        } catch (error) {
            console.error('Error fetching menus:', error);
            foodSelect.innerHTML = '<option value="">לא ניתן לטעון את המידע</option>';
        }
    }

    function populateMenusSelect(menus) {
        // if(menus instanceof Object)
        // menus = menus.data;
        console.log(menus);
        foodSelect.innerHTML = '<option value="">-- בחר תפריט אוכל --</option>';
        menus.forEach(menu => {
            const option = document.createElement("option");
            option.value = menu.SerialNumber;
            option.text = `${menu.Name} - ${menu.PricePerGuest} ש"ח`;
            option.setAttribute("data-price", menu.PricePerGuest);
            foodSelect.appendChild(option);
        });
    }

    async function fetchQuotations() {
        // const localQuotations = localStorage.getItem('quotations');
        // if (localQuotations) {
        //     quotations = JSON.parse(localQuotations);
        //     displayQuotations(quotations);
        // } else {
            await updateQuotationsFromServer();
        //}
    }

    async function updateQuotationsFromServer() {
        try {
            const response = await fetch('https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/quotation');
            console.log(response);
            if (!response.ok) throw new Error('Failed to load quotations');
            
            quotations = await response.json();
            localStorage.setItem('quotations', JSON.stringify(quotations));
            displayQuotations(quotations);
        } catch (error) {
            console.error('Error fetching quotations:', error);
            alert("Failed to load quotations.");
        }
    }

    function displayQuotations(quotations) {
        console.log(quotations);
        const quotationTable = document.getElementById("quotationTable");
        const tbody = quotationTable.querySelector("tbody");
        tbody.innerHTML = "";

        quotations.forEach(quotation => {
            const row = document.createElement("tr");
            console.log(hallsList.data);
            console.log(menusList);

            // const hall = hallsList.find(h => h.serial_number === quotation.HallNumber);
            // const hall = hallsList.data.find(h => h.SerialNumber === quotation.HallNumber);
            const hall = hallsList.data.find(h => h.serial_number === quotation.hallNumber);
            // const menu = menusList.find(m => m.serial_number === quotation.MenuNumber);
            const menu = menusList.find(m => m.SerialNumber === quotation.menuNumber);

            const hallName = hall ? hall.name : "N/A";
            const menuName = menu ? menu.Name : "N/A";

            row.innerHTML = `
                <td>${quotation.guestName}</td>
                <td>${quotation.guestId}</td>
                <td>${quotation.date}</td>
                <td>${quotation.nameOfEvent}</td>
                <td>${hallName}</td>
                <td>${menuName}</td>
                <td>${quotation.numberOfGuests}</td>
                <td>${quotation.totalPrice} ש"ח</td>
                <td>
                    <button class="edit-btn btn btn-warning btn-sm" data-id="${quotation.quotationNumber}">edit</button>
                    <button class="delete-btn btn btn-danger btn-sm" data-id="${quotation.quotationNumber}">delete</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });

        quotationTable.classList.remove("hidden");

        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", function() {
                const quotationId = this.getAttribute("data-id");
                editQuotation(quotationId);
            });
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", function() {
                const quotationId = this.getAttribute("data-id");
                console.log(quotationId);
                const confirmDelete = confirm("Are you sure you want to delete this quotation?");
                if (confirmDelete) {
                    deleteQuotation(quotationId);
                }
            });
        });
    }
    function editQuotation(quotationId) {
        const quotation = quotations.find(q => q.quotationNumber == quotationId);
        if (quotation) {
            document.getElementById("editFullName").value = quotation.guestName;
            document.getElementById("editIdNumber").value = quotation.guestId;
            document.getElementById("editEventDate").value = quotation.date;
            document.getElementById("editEventName").value = quotation.nameOfEvent;
            editHallSelect.value = quotation.hallNumber;
            editFoodSelect.value = quotation.menuNumber;
            document.getElementById("editGuestCount").value = quotation.numberOfGuests;
            showEditForm();
            quotationData.quotationNumber = quotationId;
        }
    }
    editQuotationForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        const updatedQuotation = {
            quotationNumber: quotationData.quotationNumber,
            guestName: document.getElementById("editFullName").value,
            guestId: document.getElementById("editIdNumber").value,
            date: document.getElementById("editEventDate").value,
            nameOfEvent: document.getElementById("editEventName").value,
            hallNumber: parseInt(editHallSelect.value),
            menuNumber: parseInt(editFoodSelect.value),
            numberOfGuests: parseInt(document.getElementById("editGuestCount").value),
            totalPrice: (parseInt(editHallSelect.selectedOptions[0].getAttribute("data-price")) +
                         parseInt(editFoodSelect.selectedOptions[0].getAttribute("data-price"))) *
                         parseInt(document.getElementById("editGuestCount").value)
        };
        console.log(updatedQuotation);
        try {
            const response = await fetch(`https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/quotation/${quotationData.QuotationNumber}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedQuotation)
            });

            if (!response.ok) throw new Error('Failed to update quotation');
            alert("Quotation updated successfully!");
            
            hideEditForm();
            await updateQuotationsFromServer(); // Refresh data from server after update
        } catch (error) {
            console.error('Error updating quotation:', error);
            alert("Failed to update quotation.");
        }
    });

    async function deleteQuotation(quotationId) {
        try {
            const response = await fetch(`https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/quotation/${quotationId}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error('Failed to delete quotation');
            alert("Quotation deleted successfully!");
            
            await updateQuotationsFromServer(); // Refresh data from server after deletion
        } catch (error) {
            console.error('Error deleting quotation:', error);
            alert("Failed to delete quotation.");
        }
    }

    submitQuotationButton.addEventListener("click", async function() {
        try {
            const response = await fetch("https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/quotation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(quotationData)
            });

            if (!response.ok) throw new Error('Failed to save quotation');
            alert("Quotation added successfully!");

            quotationForm.reset();
            quotationResult.classList.add("hidden");
            submitQuotationButton.classList.add("hidden");
            await updateQuotationsFromServer(); // Refresh data from server after adding new quotation
        } catch (error) {
            console.error('Error adding quotation:', error);
            alert("Failed to add quotation.");
        }
    });

    function calculateQuotation() {
        const hallPrice = parseInt(hallsSelect.options[hallsSelect.selectedIndex].getAttribute("data-price"), 10);
        const foodPrice = parseInt(foodSelect.options[foodSelect.selectedIndex].getAttribute("data-price"), 10);
        const guestCount = parseInt(document.getElementById("guestCount").value, 10);
        const totalCost = (hallPrice + foodPrice) * guestCount;

        quotationData = {
            guestName: document.getElementById("fullName").value,
            guestId: document.getElementById("idNumber").value,
            date: document.getElementById("eventDate").value,
            nameOfEvent: document.getElementById("eventName").value,
            hallNumber: parseInt(hallsSelect.value),
            menuNumber: parseInt(foodSelect.value),
            numberOfGuests: guestCount,
            totalPrice: totalCost
        };

        quotationDetailsElement.innerHTML = `
            אולם: ${hallsSelect.options[hallsSelect.selectedIndex].text}<br>
            תפריט אוכל: ${foodSelect.options[foodSelect.selectedIndex].text}<br>
            כמות אורחים: ${guestCount}<br>
            עלות כוללת: ${totalCost} ש"ח
        `;

        quotationResult.classList.remove("hidden");
        submitQuotationButton.classList.remove("hidden");
    }

    quotationForm.addEventListener("submit", function(event) {
        event.preventDefault();
        calculateQuotation();
    });

    document.getElementById("closeEditButton").addEventListener("click", hideEditForm);

    Promise.all([fetchHalls(), fetchMenus()]).then(() => {
        fetchQuotations();
    });
});
