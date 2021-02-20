$(document).ready(function () {
  paginationBlog(1);

  //Activate user
  $(document).on("click", ".activeUser", function (event) {
    //console.log("Activado")
    event.preventDefault();
    let userId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    let classId = $(this).attr("class");
    let active = classId == "btn btn-success activeUser" ? false : true;
    let changes = {
      active: active,
    };
    $.ajax({
      url: `/update-user/${userId}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(changes),
      success: function (data) {
        notificationToast(data.alert, data.message);
        paginationBlog(pageNum);
      },
    });
  });

  //Start Delete User process
  $(document).on("click", ".deleteUser", function (event) {
    event.preventDefault();
    //console.log("Borrar")
    let userId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $("#modalConfirmDeleteLongTitle").text("Confirm Delete");
    $("#modalConfirmDeleteBody").text(
      "Do you confirm you want to delete the user?"
    );
    $("#confirmDelete").attr("value", userId);
    $("#confirmDelete").attr("page", pageNum);
    $("#modalConfirmDelete").modal("show");
  });

  //Confirm Delete User
  $("#confirmDelete").click(function (event) {
    event.preventDefault();
    //console.log("Borrar")
    let userId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $.ajax({
      url: `/delete-user/${userId}`,
      type: "DELETE",
      contentType: "application/json",
      success: function (data) {
        //console.log(data)
        $("#modalConfirmDelete").modal("hide");
        notificationToast(data.alert, data.message);
        //console.log("Usuario borrado");
        paginationBlog(pageNum);
      },
    });
  });

  //Start Add Vendor Process
  $(document).on("click", ".vendorUser", function (event) {
    let userId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    event.preventDefault();
    $.get("/get-all-vendors", () => {}).then((vendors) => {
      const {data}=vendors
      for (let i=0;i<data.length;i++){
          newOption=$("<option>")
          newOption.val(data[i].vendor_no)
          newOption.text(data[i].name)
          $("#vendorInput").append(newOption)
      }
      //console.log(data);
      //console.log("Add vendor")
      $("#modalAddVendorTitle").text("Add Vendor to User");
      $("#confirmAddVendor").attr("value", userId);
      $("#confirmAddVendor").attr("page", pageNum);
      $("#modalAddVendor").modal("show");
    });
  });

  //Add Vendor Modal
  $("#addVendorForm").submit(function (event) {
    event.preventDefault();
    let vendor_no = $("#vendorInput").val();
    let UserId=$(this).find("#confirmAddVendor").attr("value");
    let pageNum=$(this).find("#confirmAddvendor").attr("page");
    //console.log(vendor)
    if (vendor_no) {
        let changes = {
            UserId: UserId,
          };
          $.ajax({
            url: `/add-user-to-vendor/${vendor_no}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(changes),
            success: function (data) {
            $("#modalAddVendor").modal("hide");
              notificationToast(data.alert, data.message);
              paginationBlog(pageNum);
            },
          });
    }
  });

  function paginationBlog(pageNumber) {
    $("#userTable").empty();
    $("#pagination-container").show();
    if ($("#pagination-container").length) {
      //console.log("Entro")
      //Pagination
      $("#pagination-container").pagination({
        dataSource: function (done) {
          $.ajax({
            type: "GET",
            url: "/get-all-users",
            success: function (response) {
              //console.log(response)
              done(response.user);
            },
          });
        },
        pageSize: 10,
        pageNumber: pageNumber,
        callback: function (data, pagination) {
          //console.log(data);
          if (data.length === 0) {
            $("#pagination-container").hide();
          } else {
            for (let i = 0; i < data.length; i++) {
              newRow = $("<tr>");
              //id
              idCol = $("<th>");
              idCol.attr("scope", "row");
              idCol.text(data[i].id);
              //user Email
              emailCol = $("<td>");
              emailCol.text(data[i].email);
              //Vendor
              vendorCol = $("<td>");
              for (let j = 0; j < data[i].Vendors.length; j++) {
                vendorDiv = $("<div>");
                vendorDiv.text(data[i].Vendors[j].vendor_no);
                vendorCol.append(vendorDiv);
              }
              //Active Button
              buttonActive = $("<button>");
              buttonActive.attr("type", "button");
              let classActive = data[i].active
                ? "btn btn-success activeUser"
                : "btn btn-danger activeUser";
              buttonActive.attr("class", classActive);
              buttonActive.attr("value", data[i].id);
              buttonActive.attr("page", pagination.pageNumber);
              activeIcon = $("<i>");
              activeIcon.attr("class", "fas fa-power-off");
              buttonActive.append(activeIcon);
              activeCol = $("<td>");
              activeCol.append(buttonActive);
              //Add Vendor Button
              buttonVendor = $("<button>");
              buttonVendor.attr("type", "button");
              buttonVendor.attr("class", "btn btn-primary vendorUser");
              buttonVendor.attr("value", data[i].id);
              buttonVendor.attr("page", pagination.pageNumber);
              vendorIcon = $("<i>");
              vendorIcon.attr("class", "fas fa-plus");
              buttonVendor.append(vendorIcon);
              addVendorCol = $("<td>");
              addVendorCol.append(buttonVendor);
              // Delete Button
              buttonDelete = $("<button>");
              buttonDelete.attr("type", "button");
              buttonDelete.attr("class", "btn btn-danger deleteUser");
              buttonDelete.attr("value", data[i].id);
              buttonDelete.attr("page", pagination.pageNumber);
              deleteIcon = $("<i>");
              deleteIcon.attr("class", "fas fa-trash-alt");
              buttonDelete.append(deleteIcon);
              deleteCol = $("<td>");
              deleteCol.append(buttonDelete);
              //Add rows
              newRow.append(idCol);
              newRow.append(emailCol);
              newRow.append(vendorCol);
              newRow.append(activeCol);
              newRow.append(addVendorCol);
              newRow.append(deleteCol);
              $("#userTable").append(newRow);
            }
          }
        },
      });
    }
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
