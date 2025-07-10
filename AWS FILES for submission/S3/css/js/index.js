let slideIndex = 0;

function showSlides() {
    const slides = document.querySelectorAll(".gallery-slide img");
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}    
    slides[slideIndex - 1].style.display = "block";  
    setTimeout(showSlides, 3000); // משנה את התמונה כל 3 שניות
}

function moveSlide(n) {
    slideIndex += n - 1;
    showSlides();
}

// Neev Functions
function parseUrl(url) {
  const result = {};

  // Get the query string or fragment part
  const queryString = url.includes('#') ? url.split('#')[1] : url.split('?')[1];

  if (!queryString) return result;

  // Split into key-value pairs
  const params = queryString.split('&');

  for (const param of params) {
    const [key, value] = param.split('=');
    if (key && value) {
      // Decode URI components and add to result object
      result[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  return result;
}

function decodeBase64Url(str) {
  // Convert base64url → base64
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with "=" if needed
  while (str.length % 4 !== 0) {
    str += '=';
  }
  return atob(str);
}

function decodeJWT(jwt) {
  const [header, payload] = jwt.split('.');

  return {
    header: JSON.parse(decodeBase64Url(header)),
    payload: JSON.parse(decodeBase64Url(payload))
  };
}

// Neev Functions


document.addEventListener('DOMContentLoaded', (event) => {
    // showSlides(); // מציג את השקפים ברגע שנטען הדף
    
    const hash = window.location.hash.substr(1); // הכל אחרי ה־#
    const params = new URLSearchParams(hash);

    const id_token = params.get("id_token");
    const access_token = params.get("access_token");

    if (params.length <= 1){
        var token = localStorage.getItem('access_token');
        if (token) {
            alert("✅ Logged in successfully!");
            var accessJWT = decodeJWT(token);
            console.log(accessJWT);

            if (accessJWT.payload['cognito:groups']?.includes('websiteoon_admins')) {
                document.getElementById('userAdminButton').style.visibility = 'visible';
            } else {
                document.getElementById('userAdminButton').style.visibility = 'hidden';
            }
            document.getElementById('usernameText').innerText = accessJWT.payload['cognito:groups']
        }
        else {
            alert("❌ Failed to login");
            document.getElementById('userAdminButton').style.visibility = 'hidden';
        }
    }
    else{
        const hash = window.location.hash.substr(1); // הכל אחרי ה־#
        const params = new URLSearchParams(hash);

        const id_token = params.get("id_token");
        const access_token = params.get("access_token");

        if (access_token) {
            localStorage.setItem("access_token", access_token);

            var accessJWT = decodeJWT(access_token);
            console.log(accessJWT);

            if (accessJWT.payload['cognito:groups']?.includes('websiteoon_admins')) {
                document.getElementById('userAdminButton').style.visibility = 'visible';
            } else {
                document.getElementById('userAdminButton').style.visibility = 'hidden';
            }

            document.getElementById('usernameText').innerText = accessJWT.payload['cognito:groups']

            localStorage.setItem("accessJWT", JSON.stringify(accessJWT));
            alert("✅ Logged in successfully!");
        }
    }
    // console.log(parsedJWT);
});


