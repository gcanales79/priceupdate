$(document).ready(function () {
  reviewPrice(1);

  function reviewPrice(pageNumber) {
    $("#priceTable").empty();
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
                //Download Button
                buttonDownload = $("<button>");
                buttonDownload.attr("type", "button");
                buttonDownload.attr("class", "btn btn-info downloadFile");
                buttonDownload.attr("value",data[j].Files[i].file_name);
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
                $("#priceTable").append(newRow);
              }
            }
          }
        },
      });
    }
  }
});
