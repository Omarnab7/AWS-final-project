document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = 'https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/menu';
    const createUrl = 'https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/menu';
    const updateUrl = 'https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/menu';
    const deleteUrl = 'https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/menu';
    const addMenuForm = document.getElementById("addMenuForm");
    const editMenuForm = document.getElementById("editMenuForm");
    const menusContainer = document.getElementById("menusContainer");
    const editMenuModal = document.getElementById("editMenuModal");
    const addMenuButton = document.getElementById("addMenuButton");
    const addMenuFormContainer = document.getElementById("addMenuFormContainer");
    const cancelAddMenu = document.getElementById("cancelAddMenu");
    const cancelEditMenu = document.getElementById("cancelEditMenu");

    // Toggle the add menu form
    addMenuButton.addEventListener("click", function () {
        addMenuFormContainer.style.display = "block";
    });

    cancelAddMenu.addEventListener("click", function () {
        addMenuFormContainer.style.display = "none";
        addMenuForm.reset();
    });

    cancelEditMenu.addEventListener("click", function () {
        editMenuModal.style.display = "none";
        editMenuForm.reset();
    });

    async function fetchAndDisplayMenus() {
        await updateMenusFromServer();
        // const localMenus = localStorage.getItem('menus');
        // if (localMenus) {
        //     const menus = JSON.parse(localMenus);
        //     displayMenus(menus);
        // } else {
        //     await updateMenusFromServer();
        // }
    }

    async function updateMenusFromServer() {
        menusContainer.innerHTML = '<p>טוען נתונים...</p>';
        try {
            // 3. AWAIT the fetch
            const response = await fetch(apiUrl);
            
            // 4. Verify response
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // 5. AWAIT the JSON parsing
            const result = await response.json();
            // console.log("API Response:", result); // DEBUG

            // 6. Validate data structure
            if (!result?.data || !Array.isArray(result.data)) {
                throw new Error("Invalid data format from API");
            }

            // 7. Only now process data
            localStorage.setItem('menus', JSON.stringify(result.data));
            displayMenus(result.data);

        } catch (error) {
            console.error("Load failed:", error);
            
            // // 8. Try cached data if available
            // const cached = localStorage.getItem('menus');
            // if (cached) {
            //     try {
            //         const parsed = JSON.parse(cached);
            //         if (Array.isArray(parsed)) {
            //         displayMenus(parsed);
            //         return;
            //         }
            //     } catch (e) {
            //         console.error("Bad cached data:", e);
            //     }
            // }
            
            // 9. Final fallback
            menusContainer.innerHTML = '<p>שגיאה בטעינת הנתונים. נא לנסות שנית.</p>';
        }
    }


    function displayMenus(menus) {
        menusContainer.innerHTML = '';
        // console.log(menus);
        menus.forEach(menu => {
            const menuCard = document.createElement("div");
            menuCard.className = "menu";
            menuCard.innerHTML = `
                <h3 class="menu-title" data-serial="${menu.SerialNumber}">
                    ${menu.Name} - ${menu.PricePerGuest} ש"ח
                </h3>
                <div class="menu-details" style="display: none;">
                    <p>מנה ראשונה: ${menu.FirstCourse}</p>
                    <p>מנה עיקרית: ${menu.SecondCourse}</p>
                    <p>קינוח: ${menu.Dessert}</p>
                    <div class="button-container">
                        <button onclick="openEditMenuModal(${menu.SerialNumber})">ערוך</button>
                        <button onclick="deleteMenu(${menu.SerialNumber})">מחק</button>
                    </div>
                </div>
            `;
            menusContainer.appendChild(menuCard);

            const menuTitle = menuCard.querySelector(".menu-title");
            const menuDetails = menuCard.querySelector(".menu-details");
            menuTitle.addEventListener("click", function () {
                menuDetails.style.display = menuDetails.style.display === "none" ? "block" : "none";
            });
        });
    }

    addMenuForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const newMenu = {
            Name: document.getElementById("menuName").value,
            FirstCourse: document.getElementById("firstCourse").value,
            SecondCourse: document.getElementById("secondCourse").value,
            Dessert: document.getElementById("dessert").value,
            PricePerGuest: parseFloat(document.getElementById("pricePerGuest").value)
        };

        try {
            const response = await fetch(createUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMenu)
            });
            console.log(response.ok);
            console.log(response);
            if (!response.ok) throw new Error('Failed to create menu');
            alert('תפריט נוסף בהצלחה!');
            addMenuForm.reset();
            addMenuFormContainer.style.display = "none";
            await updateMenusFromServer(); // Refresh local storage and display
        } catch (error) {
            console.error('Error creating menu:', error);
            alert('שגיאה בהוספת התפריט.');
        }
        finally{
            // location.reload(true);
        }
    });

    window.openEditMenuModal = async function(serialNumber) {
        const menus = JSON.parse(localStorage.getItem('menus')) || [];
        const menu = menus.find(m => m.SerialNumber === serialNumber);

        if (menu) {
            document.getElementById("editMenuSerialNumber").value = menu.SerialNumber;
            document.getElementById("editMenuName").value = menu.Name;
            document.getElementById("editFirstCourse").value = menu.FirstCourse;
            document.getElementById("editSecondCourse").value = menu.SecondCourse;
            document.getElementById("editDessert").value = menu.Dessert;
            document.getElementById("editPricePerGuest").value = menu.PricePerGuest;
            
            editMenuModal.style.display = "flex";
        } else {
            alert('תפריט לא נמצא');
        }
    };

    editMenuForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const updatedMenu = {
            SerialNumber: document.getElementById("editMenuSerialNumber").value,
            Name: document.getElementById("editMenuName").value,
            FirstCourse: document.getElementById("editFirstCourse").value,
            SecondCourse: document.getElementById("editSecondCourse").value,
            Dessert: document.getElementById("editDessert").value,
            PricePerGuest: parseFloat(document.getElementById("editPricePerGuest").value)
        };

        try {
            const response = await fetch(`${updateUrl}`,{ // /${updatedMenu.SerialNumber}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedMenu)
            });
            if (!response.ok) throw new Error('Failed to update menu');

            alert('תפריט עודכן בהצלחה!');
            await updateMenusFromServer(); // Refresh local storage and display
            closeEditMenuModal();
        } catch (error) {
            console.error('Error updating menu:', error);
            alert('שגיאה בעדכון התפריט.');
        }
    });

    window.closeEditMenuModal = function() {
        editMenuModal.style.display = "none";
    };

    window.deleteMenu = async function(serialNumber) {
        if (confirm('האם אתה בטוח שברצונך למחוק את התפריט?')) {
            try {
                console.log(serialNumber);
                const response = await fetch(`${deleteUrl}/${serialNumber}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete menu');

                alert('תפריט נמחק בהצלחה.');
                await updateMenusFromServer(); // Refresh local storage and display
            } catch (error) {
                console.error('Error deleting menu:', error);
                alert('שגיאה במחיקת התפריט.');
            }
        }
    };

    fetchAndDisplayMenus();
});
