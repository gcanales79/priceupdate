$(document).ready(function () {
  let userId = localStorage.getItem("USERID");
  //console.log(userId)

  let vendor_items = [];
  //Create selector for Part Numbers
  $.get(`/get-items/${userId}`, () => {}).then((data) => {
    //data son los NP
    console.log(data);
    let partNumbers = data.sort();
    for (let i = 0; i < partNumbers.length; i++) {
      newOption = $("<option>");
      newOption.attr("value", partNumbers[i]);
      newOption.text(partNumbers[i]);
      $("#partNumber").append(newOption);
    }
  });

  //Submit Form
  $("#submitPrice").submit(function (event) {
    event.preventDefault();
    //console.log("Hello")
    let item_no = $("#partNumber").val();
    let starting_date = moment($("#startingDate").val()).format("YYYY-MM-DD");
    let ending_date = moment($("#endingDate").val()).format("YYYY-MM-DD");
    let base_price = $("#basePrice").val();
    let surcharge = $("#surchargePrice").val();
    let currency = $("#currency").val();
    let unit_measure = $("#unitMeasure").val();
    if (
      item_no &&
      starting_date &&
      ending_date &&
      base_price &&
      surcharge &&
      currency &&
      unit_measure
    ) {
      if (ending_date <= starting_date) {
        notificationToast(
          "Error",
          "Starting Date can't be before the Ending Date"
        );
      } else {
        //console.log("Form Correct")

        $.post("/post-new-pricing", {
          item_no: item_no,
          starting_date: starting_date,
          ending_date: ending_date,
          base_price: base_price,
          surcharge: surcharge,
          currency: currency,
          unit_measure: unit_measure,
        }).then((data) => {
          notificationToast(data.alert, data.message);
          $("#submitPrice").trigger("reset");
          $("#submitPrice").removeClass("was-validated");
          setTimeout(function () {
            console.log("Timeout");
            $("#submitPrice").removeClass("was-validated");
          }, 5);
        });
      }
    }
  });

  //Schema to Review Pricing File
  const schema = {
    "Part Number": {
      prop: "item_no",
      type: Number,
      required: true,
    },
    "Starting Date": {
      prop: "starting_date",
      type: Date,
      required: true,
    },
    "Ending Date": {
      prop: "ending_date",
      type: Date,
      required: true,
    },
    "Base Price": {
      prop: "base_price",
      type: Number,
      required: true,
    },
    Surcharge: {
      prop: "surcharge",
      type: Number,
    },
  };

  //Review File Data from Excel File
  $("#input").on("change", function (event) {
    $("#fileError").removeClass("alert alert-danger");
    $("#fileError").empty();
    event.preventDefault();

    fileName = input.files[0].name;
    fileExt = fileName.split(".")[1];
    //console.log(fileExt);
    //console.log(fileExt === "xlsx");
    if (fileExt !== "xlsx" && fileExt !== "xls") {
      $("#fileError").addClass("alert alert-danger");
      $("#fileError").text("The file needs to be a valid Excel file");
      $("#input").val(null);
    }
    readXlsxFile(input.files[0], { schema }).then(({ rows, errors }) => {
      console.log(rows);
      // `errors` have shape `{ row, column, error, value }`.
      //console.log(errors);
      if (errors.length > 0) {
        if (errors[0].error === "required") {
          $("#fileError").addClass("alert alert-danger");
          $("#fileError").text(
            `The file has an error, you are missing a ${errors[0].error} value in column ${errors[0].column}. Please Correct the file.`
          );
          $("#input").val(null);
        } else if (errors[0].error === "invalid") {
          $("#fileError").addClass("alert alert-danger");
          $("#fileError").text(
            `The file has an ${errors[0].error} value in column ${errors[0].column}. Please correct the file`
          );
          $("#input").val(null);
        } else {
          $("#fileError").addClass("alert alert-danger");
          $("#fileError").text(
            `There is an error on the file please review the file format.`
          );
          $("#input").val(null);
        }
      } else {
        //console.log(rows);
        let errorDate = false;
        for (let i = 0; i < rows.length; i++) {
          startDate = moment(rows[i].starting_date);
          endDate = moment(rows[i].ending_date);
          deltaDays = endDate.diff(startDate, "days");
          if (deltaDays <= 0) {
            errorDate = true;
            break;
          }
        }
        if (errorDate) {
          $("#fileError").addClass("alert alert-danger");
          $("#fileError").text(
            `One of the Ending Date is before the Start Date please correct the file.`
          );
          $("#input").val(null);
        } else {
          $.get(`/get-items/${userId}`, () => {}).then((data) => {
            let errorItem = false;
            for (let i = 0; i < rows.length; i++) {
              let itemFound = $.inArray(rows[i].item_no.toString(), data);
              //console.log(itemFound)
              if (itemFound < 0) {
                errorItem = true;
                break;
              }
            }
            if (errorItem) {
              $("#fileError").addClass("alert alert-danger");
              $("#fileError").text(
                `One of the part numbers you are trying to submit is not assign to you`
              );
              $("#input").val(null);
            } else {
              $("#buttonPrice").attr("disabled", false);
            }
          });
        }
      }
    });
  });

  //Submitt file
  $("#buttonPrice").on("click", function (event) {
    event.preventDefault();
    readXlsxFile(input.files[0], { schema }).then(({ rows, errors }) => {
      //Function to review there are no duplicated contract
      for (let i = 0; i < rows.length; i++) {
        console.log(rows[i].item_no);
        let validContract = [];
        $.get(
          `/find-a-current-price/${rows[i].item_no}/${rows[i].starting_date}/${rows[i].ending_date}`,
          () => {}
        ).then((contract) => {
          //console.log(contract);
          if (contract) {
            let newDiv = $("<div>");
            newDiv.addClass("alert alert-danger");
            newDiv.text(
              `The part number ${rows[i].item_no} has a valid contract. The file was not submitted. `
            );
            $("#fileError").append(newDiv);
            validContract.push(rows[i].item_no);
            $("#input").val(null);
          }
          if (i === rows.length - 1) {
            if (validContract.length === 0) {
              var formData = new FormData();
              var file = document.getElementById("input").files[0];
              formData.append("priceFile", file);
              formData.append("UserId", userId);
              $.ajax({
                type: "POST",
                url: "/fileupload",
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                  $("#input").val(null);
                  notificationToast(data.alert, data.message);
                },
              });
            }
          }
        });
      }
    });
  });

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
