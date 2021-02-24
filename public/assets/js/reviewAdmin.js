$(document).ready(function () {
  reviewPrice(1);

  //Download file
  $(document).on("click", ".downloadFile", function (event) {
    event.preventDefault();
    $("#alertArea").append(newDiv);
    let fileName = $(this).attr("value");
    //console.log("Download")
    /*$.get(`/download/${fileName}`,()=>{}).then((data)=>{
      //console.log(data)
      notificationToast(data.alert, data.message);
    })*/
    window.open(`/download/${fileName}`);
  });

  //Approve File
  $(document).on("click", ".approvePrice", function (event) {
    event.preventDefault();
    $("#alertArea").empty();
    let fileId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $.get(`/validate-price-file/${fileId}`, () => {}).then((rows) => {
      //console.log(rows)
      //Function to review there are no duplicated contract
      let existingContract = [];
      let uniqueContract = [];
      for (let i = 0; i < rows.length; i++) {
        console.log(rows[i].item_no);

        $.get(
          `/find-a-current-price/${rows[i].item_no}/${rows[i].starting_date}/${rows[i].ending_date}`,
          () => {}
        ).then((contract) => {
          //console.log(contract);
          if (contract) {
            existingContract.push(rows[i].item_no);
          }
          //console.log(existingContract);
          if (i === rows.length - 1) {
            $.each(existingContract, function (j, el) {
              if ($.inArray(el, uniqueContract) === -1) uniqueContract.push(el);
            });
            //console.log(uniqueContract);
            for (let k = 0; k < uniqueContract.length; k++) {
              let newDiv = $("<div>");
              newDiv.addClass("alert alert-danger");
              newDiv.text(
                `The part number ${uniqueContract[k]} has a valid contract. The file was not approved. `
              );
              $("#alertArea").append(newDiv);
            }
            if (existingContract.length === 0) {
              postPrices(rows, pageNum, fileId);
            }
          }
        });
      }
    });
  });

  //Post New prices
  function postPrices(data, pageNum, fileId) {
    for (let i = 0; i < data.length; i++) {
      $.get(`/get-item-info/${data[i].item_no}`, () => {}).then((part) => {
        $.post("/new-pricing", {
          item_no: data[i].item_no,
          starting_date: data[i].starting_date,
          ending_date: data[i].ending_date,
          base_price: data[i].base_price,
          surcharge: data[i].surcharge,
          ItemId: part.id,
          confirmed: "Approved",
        }).then((response) => {
          if (i == data.length - 1) {
            let changes = {
              status: "Approved",
            };
            $.ajax({
              url: `/reject-file-price/${fileId}`,
              type: "PUT",
              contentType: "application/json",
              data: JSON.stringify(changes),
              success: function (data) {
                notificationToast(data.alert, data.message);
                reviewPrice(pageNum);
              },
            });
          }
        });
      });
    }
  }

  //Reject File
  $(document).on("click", ".rejectPrice", function (event) {
    event.preventDefault();
    $("#alertArea").append(newDiv);
    let fileId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    let changes = {
      status: "Reject",
    };
    //console.log("Approve")
    $.ajax({
      url: `/reject-file-price/${fileId}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(changes),
      success: function (data) {
        notificationToast(data.alert, data.message);
        reviewPrice(pageNum);
      },
    });
  });

  function reviewPrice(pageNumber) {
    $("#priceTableBody").empty();
    $("#tablePrice").removeClass("table-hover");
    $("#emptyData").empty();
    $("#pagination-container").show();
    if ($("#pagination-container").length) {
      //console.log("Entro")
      //Pagination
      $("#pagination-container").pagination({
        dataSource: function (done) {
          $.ajax({
            type: "GET",
            url: "/get-pending-files",
            success: function (response) {
              //console.log(response)
              done(response);
            },
          });
        },
        pageSize: 10,
        pageNumber: pageNumber,
        callback: function (data, pagination) {
          //console.log(data);
          if (data.length === 0) {
            $("#pagination-container").hide();
            $("#emptyData").text(" No pending files to approve");
          } else {
            for (let j = 0; j < data.length; j++) {
              for (let i = 0; i < data[j].Files.length; i++) {
                newRow = $("<tr>");
                //Part Number
                idCol = $("<th>");
                idCol.attr("scope", "row");
                idCol.text(data[j].Files[i].id);
                newRow.append(idCol);
                //Vendor Id
                vendorIdCol = $("<td>");
                for (let k = 0; k < data[j].Vendors.length; k++) {
                  vendorDiv = $("<div>");
                  vendorDiv.text(
                    `${data[j].Vendors[k].vendor_no} - ${data[j].Vendors[k].name}`
                  );
                  vendorIdCol.append(vendorDiv);
                }
                newRow.append(vendorIdCol);
                //Vendor Email
                emailCol = $("<td>");
                emailCol.text(data[j].email);
                newRow.append(emailCol);
                //Date Submitted
                dateCol = $("<td>");
                let dateFile = moment(data[j].Files[i].createdAt).format(
                  "DD-MM-YYYY"
                );
                dateCol.text(dateFile);
                newRow.append(dateCol);
                //Download Button
                buttonDownload = $("<button>");
                buttonDownload.attr("type", "button");
                buttonDownload.attr("class", "btn btn-primary downloadFile");
                buttonDownload.attr("value", data[j].Files[i].file_name);
                downloadIcon = $("<i>");
                downloadIcon.attr("class", "fas fa-cloud-download-alt");
                buttonDownload.append(downloadIcon);
                downloadCol = $("<td>");
                downloadCol.append(buttonDownload);
                newRow.append(downloadCol);
                //Approve Button
                buttonApprove = $("<button>");
                buttonApprove.attr("type", "button");
                buttonApprove.attr("class", "btn btn-success approvePrice");
                buttonApprove.attr("value", data[j].Files[i].id);
                buttonApprove.attr("page", pagination.pageNumber);
                buttonApprove.css("margin", "5px");
                approveIcon = $("<i>");
                approveIcon.attr("class", "fas fa-check");
                buttonApprove.append(approveIcon);
                approveCol = $("<td>");
                approveCol.append(buttonApprove);
                newRow.append(approveCol);
                // Reject Button
                buttonReject = $("<button>");
                buttonReject.attr("type", "button");
                buttonReject.attr("class", "btn btn-danger rejectPrice");
                buttonReject.attr("value", data[j].Files[i].id);
                buttonReject.attr("page", pagination.pageNumber);
                buttonReject.css("margin", "5px");
                rejectIcon = $("<i>");
                rejectIcon.attr("class", "fas fa-times");
                buttonReject.append(rejectIcon);
                rejectCol = $("<td>");
                rejectCol.append(buttonReject);
                newRow.append(rejectCol);
                //Add rows
                $("#priceTableBody").append(newRow);
                $("#tablePrice").addClass("table-hover");
              }
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
});
