
function makeUserEntry(email, role){
    row_class = "border-t border-t-[#dbe0e6]";
    row_email_class = "table-0da3bf00-9942-4b00-8e26-b8f8c2dc973a-column-120 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal";
    row_role_class = "table-0da3bf00-9942-4b00-8e26-b8f8c2dc973a-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal";
    row_button_class = "table-0da3bf00-9942-4b00-8e26-b8f8c2dc973a-column-360 h-[72px] px-4 py-2 w-60 text-[#60758a] text-sm font-bold leading-normal tracking-[0.015em]";

    table_body = document.getElementById("userTableBig");
    const row = document.createElement('tr');
    // row.classList.add(row_class);
    row.classList += row_class;
    
    // Create and append cells
    const email_cell = document.createElement('td');
    email_cell.textContent = email;
    // email_cell.classList.add(row_email_class);
    email_cell.classList += row_email_class;
    row.appendChild(email_cell);

    const role_cell = document.createElement('td');
    role_cell.textContent = role;
    // role_cell.classList.add(row_role_class);
    role_cell.classList += row_role_class;
    row.appendChild(role_cell);

    const delete_cell = document.createElement('td');
    var   button_cell = document.createElement('button');
    // button_cell.classList.add(row_button_class);
    // button_cell.classList.add(row_button_class);
    button_cell.innerText = "Delete User";
    button_cell.setAttribute('email_value', email);

    button_cell.addEventListener('click', function(event) {
        const customValue = this.getAttribute('email_value');
        deleteUserCallback(customValue);
    });

    delete_cell.appendChild(button_cell);
    row.appendChild(delete_cell);

    table_body.appendChild(row);
}

function clearTableCrap(){
    document.getElementById("userTableBig").innerHTML = "";
}

var global_token;
async function main() {
  try {
    // Get token from checkLogin()
    const token = await checkLogin();
    console.log(token);
    global_token = token;

    if (token) {
      // Make authenticated request
      const response = await fetch('https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/testusers', {
        method: 'GET', // or 'POST', 'PUT', etc.
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include token in Authorization header
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      doSomething(data);
    } else {
      console.log('No token available - user not logged in');
      doSomething(null, new Error('Not authenticated'));
    }
  } catch (error) {
    console.error('Error:', error);
    doSomething(null, error);
  }
}

// Helper function for the fetch operation
async function fetchAndDoSomething(url, token) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    doSomething(data);
  } catch (error) {
    doSomething(null, error);
  }
}

function deleteUserCallback(data) {
  try {
    const url = "https://fo5rigq3qe.execute-api.us-east-2.amazonaws.com/testusers";
    fetch(`${url}/${data}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${global_token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    doSomething(null, error);
  }
  finally{
    window.location.reload();
  }
  
}

// Your checkLogin function should look something like this:
async function checkLogin() {
  // Implementation that returns a Promise resolving to the token
  return localStorage.getItem('access_token') || null;
}

// Your doSomething function
function doSomething(data, error) {
  if (error) {
    console.error('Operation failed:', error);
    // Handle error case
    return;
  }
  console.log('Success! Data:', data);
  console.log('Success! Data:', data.users);

  for (user in data.users){
    var email = data.users[user]["userEmail"];
    var groups = data.users[user]["groups"];
    if (groups.length == 0){
        makeUserEntry(email, "user");
    }
    else{
        makeUserEntry(email, "admin");
    }
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
    clearTableCrap();
    // makeUserEntry("neev", "aba");
    // makeUserEntry("orel", "ben");
    
    main();
});



