$(document).ready(function () {
  let userId = localStorage.getItem("USERID");
  //console.log(userId);
  let vendor_items = [];
  $.get(`/get-items/${userId}`, () => {}).then((data) => {
    //data son los NP

    //console.log(data)
    for (let i = 0; i < data.length; i++) {
      $.get(`/get-pricing/${data[i]}`, () => {}).then((items) => {
        //console.log(items)
        if (items.length === 0) {
          let pn_info = {
            item_no: data[i],
            starting_date: "NA",
            ending_date: "NA",
            base_price: "NA",
            surcharge: "NA",
            currency: "NA",
            unit_measure: "NA",
            expired: "NA",
            confirm: "NA",
            comments: "NA",
          };
          //console.log(pn_info);
          vendor_items.push(pn_info);
        } else {
          let confirm = items[0].confirm ? "Yes" : "No";
          let today = moment();
          let endingDate = moment(items[0].ending_date);
          let expiringDay = today.diff(endingDate, "days");
          //console.log(expiringDay)
          let expired = expiringDay > 0 ? "Yes" : "No";
          let pn_info = {
            item_no: data[i],
            starting_date: moment(items[0].starting_date).format("DD-MM-YYYY"),
            ending_date: moment(items[0].ending_date).format("DD-MM-YYYY"),
            base_price: items[0].base_price,
            surcharge: items[0].surcharge,
            currency: items[0].currency,
            unit_measure: items[0].unit_measure,
            expired: expired,
            confirm: confirm,
            comments: items[0].comments,
          };
          //console.log(pn_info);
          vendor_items.push(pn_info);
        }
        if (data.length-1 == i) {
          console.log(vendor_items);
          createTable(vendor_items);
        }
      });
    }
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
      stDateCol.text(data[i].starting_date);
      newRow.append(stDateCol);
      //Ending Date
      endDateCol = $("<td>");
      endDateCol.text(data[i].ending_date);
      newRow.append(endDateCol);
      //Base Price
      bsPriceCol = $("<td>");
      bsPriceCol.text(data[i].base_price);
      newRow.append(bsPriceCol);
      //Surcharge
      scPriceCol = $("<td>");
      scPriceCol.text(data[i].surcharge);
      newRow.append(scPriceCol);
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
      unitStatusCol.text(data[i].expired);
      newRow.append(unitStatusCol);
      //Price confirmed
      confirmCol = $("<td>");
      confirmCol.text(data[i].confirm);
      newRow.append(confirmCol);
      //Comments
      commentsCol = $("<td>");
      commentsCol.text(data[i].comments);
      //newRow.append(commentsCol);
      //Add row
      $("#itemsVendorTableBody").append(newRow);
    }
    $("#VendorTable").DataTable({
        dom: 'Bfrtip',
        buttons: [ {
            extend: 'excelHtml5',
            text:"Save as Excel",
            customize: function( xlsx ) {
                var sheet = xlsx.xl.worksheets['sheet1.xml'];
            }
        } ]
    });
  }
});
