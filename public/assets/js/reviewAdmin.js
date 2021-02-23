$(document).ready(function () {
  reviewPrice(1);

  function reviewPrice(pageNumber) {
    $("#priceTable").empty();
    $("#pagination-container").show();
    if ($("#pagination-container").length) {
      //console.log("Entro")
      //Pagination
      $("#pagination-container").pagination({
        dataSource: function (done) {
          $.ajax({
            type: "GET",
            url: "/get-price-pending",
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
          } else {
            for (let i = 0; i < data.length; i++) {
              newRow = $("<tr>");
              //Part Number
              idCol = $("<th>");
              idCol.attr("scope", "row");
              idCol.text(data[i].item_no);
              //Starting Date
              sDateCol = $("<td>");
              sDateCol.text(moment(data[i].starting_date).format("DD-MM-YYYY"));
              //End Date
              eDateCol = $("<td>");
              eDateCol.text(moment(data[i].ending_date).format("DD-MM-YYYY"));
              //Base Price
              basePriceCol = $("<td>");
              basePriceCol.text(data[i].base_price);
              //Surcharge
              surchargeCol = $("<td>");
              surchargeCol.text(data[i].surcharge);
              //Total Price
              totalPriceCol = $("<td>");
              let totalPrice =
                parseFloat(data[i].base_price) + parseFloat(data[i].surcharge);
              totalPriceCol.text(totalPrice);
              //Currency
              currencyCol = $("<td>");
              currencyCol.text(data[i].Item.currency);
              //Unit of Measure
              measureCol = $("<td>");
              measureCol.text(data[i].Item.unit_measure);
              //Approve Button
              buttonApprove = $("<button>");
              buttonApprove.attr("type", "button");
              buttonApprove.attr("class", "btn btn-success approvePrice");
              buttonApprove.attr("value", data[i].id);
              buttonApprove.attr("page", pagination.pageNumber);
              buttonApprove.css("margin","5px")
              approveIcon = $("<i>");
              approveIcon.attr("class", "fas fa-check");
              buttonApprove.append(approveIcon);
              actionCol = $("<td>");
              actionCol.append(buttonApprove);
              // Reject Button
              buttonReject = $("<button>");
              buttonReject.attr("type", "button");
              buttonReject.attr("class", "btn btn-danger rejectPrice");
              buttonReject.attr("value", data[i].id);
              buttonReject.attr("page", pagination.pageNumber);
              buttonReject.css("margin","5px")
              rejectIcon = $("<i>");
              rejectIcon.attr("class", "fas fa-times");
              buttonReject.append(rejectIcon);
              actionCol.append(buttonReject);
              //Add rows
              newRow.append(idCol);
              newRow.append(sDateCol);
              newRow.append(eDateCol);
              newRow.append(basePriceCol);
              newRow.append(surchargeCol);
              newRow.append(totalPriceCol);
              newRow.append(currencyCol);
              newRow.append(measureCol);
              newRow.append(actionCol);
              $("#priceTable").append(newRow);
            }
          }
        },
      });
    }
  }
});
