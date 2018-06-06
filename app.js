window.addEventListener('load', function() {
  var profileID;
  var userProfile;
  var content = document.querySelector('.content');
  var loadingSpinner = document.getElementById('loading');
  content.style.display = 'block';
  loadingSpinner.style.display = 'none';

  var webAuth = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    redirectUri: AUTH0_CALLBACK_URL,
    audience: 'https://' + AUTH0_DOMAIN + '/userinfo',
    responseType: 'token id_token',
    scope: 'openid profile',
    leeway: 60
  });

  var loginStatus = document.querySelector('.container h4');
  var loginView = document.getElementById('login-view');
  var homeView = document.getElementById('home-view');
  var profileView = document.getElementById('profile-view');
  var passwordView = document.getElementById('password-view');

  // buttons and event listeners
  var loginBtn = document.getElementById('qsLoginBtn');
  var logoutBtn = document.getElementById('qsLogoutBtn');
  var changePasswordBtn = document.getElementById('change-password');

  var homeViewBtn = document.getElementById('btn-home-view');
  var profileViewBtn = document.getElementById('btn-profile-view');

  homeViewBtn.addEventListener('click', function() {
    homeView.style.display = 'inline-block';
    profileView.style.display = 'none';
    passwordView.style.display = 'none';
  });

  profileViewBtn.addEventListener('click', function() {
    homeView.style.display = 'none';
    profileView.style.display = 'inline-block';
    passwordView.style.display = 'none';
    getProfile();
  });

  changePasswordBtn.addEventListener('click', function() {
    homeView.style.display = 'none';
    profileView.style.display = 'none';
    passwordView.style.display = 'inline-block';
  });

  loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    webAuth.authorize();
  });

  logoutBtn.addEventListener('click', logout);

  function setSession(authResult) {
    // Set the time that the access token will expire at
    var expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  function logout() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    displayButtons();
  }

  function isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  function displayButtons() {
    var loginStatus = document.querySelector('#login-status');
    if (isAuthenticated()) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      profileViewBtn.style.display = 'inline-block';
      loginStatus.innerHTML =
        'You are now logged in. Please click services for more information.';
    } else {
      homeView.style.display = 'inline-block';
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      profileViewBtn.style.display = 'none';
      profileView.style.display = 'none';
      loginStatus.innerHTML =
        'You are not logged in! Please log in to continue.';
    }
  }

  function getProfile() {
    console.log("fshduahf")
    if (!userProfile) {
      var accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        console.log('Access token must exist to fetch profile');
      }

      webAuth.client.userInfo(accessToken, function(err, profile) {
        if (profile) {
          userProfile = profile;
          console.log(profile)
          displayProfile();
        }
      });
    } else {
      displayProfile();
    }
  }

  function displayProfile() {
    // display the profile
    document.getElementById('profile-email').innerHTML = userProfile.name;
    document.getElementById('profile-nickname').innerHTML = userProfile.nickname;
    document.getElementById('profile-updated').innerHTML = userProfile.updated_at;
    document.getElementById('profile-sub').innerHTML = userProfile.sub;
    profileID = userProfile.sub.substring(6, userProfile.sub.length);
  }

  function handleAuthentication() {
    webAuth.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        setSession(authResult);
        loginBtn.style.display = 'none';
        homeView.style.display = 'inline-block';
      } else if (err) {
        homeView.style.display = 'inline-block';
        console.log(err);
        if(err.error == "unauthorized") {
          window.location = "/unauthorized.html"
        } else {
          alert(
            'Error: ' + err.error + '. Check the console for further details.'
          );
        }
      }
      displayButtons();
    });
  }

  $("#submitReset").click(()=>{
    var password1 = $("#newPassword").val();
    var password2 = $("#verifyPassword").val();
  
    if (password1.length < 8) {
      $("#passwords-error")
        .text("Your password must be at least 8 characters.")
        .fadeIn();
    } else if (password1 != password2) {
      $("#passwords-error")
        .text("The passwords do not match.")
        .fadeIn();
    } else {
      $("#passwords-error")
        .fadeOut(()=>{
          $("#passwords-success")
            .text("Submitting...")
            .fadeIn()
        });
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://wearpulse.auth0.com/api/v2/users/" + profileID,
        "method": "PATCH",
        "headers": {
          "content-type": "application/json"
        },
        "processData": false,
        "data": "{\"client_id\": \"" + AUTH0_CLIENT_ID + "\", \"password\": \"" + password1 + "\",\"connection\": \"internal\"}"
      }
      console.log(settings)
      $.ajax(settings).done(function (response) {
        console.log(response);
        $("#passwords-success").text("Password Reset Successfully.")
      });
    }
  })

  handleAuthentication();
});