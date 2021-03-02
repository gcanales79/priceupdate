$(document).ready(function () {
  $("#alertArea").empty();
  $("#alertArea").removeClass("alert alert-success")
  // Getting references to our form and inputs
  var loginForm = $("form.login");
  var emailInput = $("input#email-input");
  var passwordInput = $("input#password-input");

  // When the form is submitted, we validate there's an email and password entered
  loginForm.on("submit", function (event) {
    event.preventDefault();

    var userData = {
      email: emailInput.val().trim(),
      password: passwordInput.val().trim(),
    };

    if (!userData.email || !userData.password) {
      return;
    }

    // If we have an email and password we run the loginUser function and clear the form
    loginUser(userData.email, userData.password);
    emailInput.val("");
    passwordInput.val("");
    setTimeout(function() {
      $("#loginForm").removeClass("was-validated")
    },5)
  });

  // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
  function loginUser(email, password) {
    $.post("/signup", {
      email: email,
      password: password,
    }).then((data) => {
      //console.log(data);
      if (data.alert === "Success") {
        //notificationToast(data.alert, data.message);
        $("#alertArea").addClass("alert alert-success")
        $("#alertArea").text(data.message)
        //localStorage.setItem("ACCESS_TOKEN", data.accessToken);
        //localStorage.setItem("REFRESH_TOKEN", data.refreshToken);
        //window.location.href = "./";
      } else {
        notificationToast(data.alert, data.message);
      }
    
    });
  }

  function notificationToast(result, message) {
    //console.log(message)
    //console.log("Entro")
    switch (result) {
      case "Success":
        $.notify(
          {
            icon: "far fa-check-circle",
            message: message,
          },
          {
            type: "success",
            allow_dismiss: false,
          }
        );
        break;
      case "Error":
        //console.log("Error")
        $.notify(
          {
            icon: "far fa-times-circle",
            message: message,
          },
          {
            type: "danger",
            allow_dismiss: false,
          }
        );
        break;
    }
  }

  (function () {
    "use strict";

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll(".needs-validation");

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms).forEach(function (form) {
      form.addEventListener(
        "submit",
        function (event) {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }

          form.classList.add("was-validated");
        },
        false
      );
    });
  })();
});
