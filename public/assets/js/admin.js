$(document).ready(function () {
  $.get("/get-all-prices", () => {}).then((data) => {
    createTable(data);
  });

  function createTable(data) {
    //console.log(data);
    //console.log(data.length);
    for (let i = 0; i < data.length; i++) {
      //console.log("Entro");
      newRow = $("<tr>");
      //Vendor No.
      vendorCol = $("<th>");
      vendorCol.attr("scope", "row");
      vendorCol.text(data[i].item_no);
      newRow.append(vendorCol);
      //Starting Date
      stDateCol = $("<td>");
      stDateCol.text(moment(data[i].starting_date).format("DD-MM-YYYY"));
      newRow.append(stDateCol);
      //Ending Date
      endDateCol = $("<td>");
      endDateCol.text(moment(data[i].ending_date).format("DD-MM-YYYY"));
      newRow.append(endDateCol);
      //Base Price
      bsPriceCol = $("<td>");
      bsPriceCol.text(data[i].base_price);
      newRow.append(bsPriceCol);
      //Surcharge
      scPriceCol = $("<td>");
      scPriceCol.text(data[i].surcharge);
      newRow.append(scPriceCol);
      //Total Price
      let totalPrice =
        parseFloat(data[i].base_price) + parseFloat(data[i].surcharge);
      totalPriceCol = $("<td>");
      totalPriceCol.text(totalPrice);
      newRow.append(totalPriceCol);
      //Currency
      currencyCol = $("<td>");
      currencyCol.text(data[i].currency);
      newRow.append(currencyCol);
      //Unit of Measure
      unitCol = $("<td>");
      unitCol.text(data[i].unit_measure);
      newRow.append(unitCol);
      //Status
      unitStatusCol = $("<td>");
      let today=moment()
      let endDate=moment(data[i].ending_date)
      let difDate=endDate.diff(today,"days")
      let status =
        (difDate >=0)
          ? "Valid"
          : "Expired";
      unitStatusCol.text(status);
      newRow.append(unitStatusCol);
      //Price confirmed
      confirmCol = $("<td>");
      confirmCol.text(data[i].confirmed);
      newRow.append(confirmCol);
      //Comments
      commentsCol = $("<td>");
      commentsCol.text(data[i].comments);
      //newRow.append(commentsCol);
      //Add row
      $("#itemsTableBody").append(newRow);
    }
    $("#ItemsTable").DataTable({
      dom: "Bfrtip",
      buttons: [
        {
          extend: "excelHtml5",
          text: "Save as Excel",
          customize: function (xlsx) {
            var sheet = xlsx.xl.worksheets["sheet1.xml"];
          },
        },
      ],
    });
  }
});
