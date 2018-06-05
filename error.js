$(()=>{
    console.log("Authentication Error:")
    var errorDetails = getJsonFromUrl();
    console.log(errorDetails)
    $("#clientID").text(errorDetails.client_id);
    $("#connection").text(errorDetails.connection);
    $("#error").text(errorDetails.error);
    $("#errorDescription").text(errorDetails.error_description);
    $("#tracking").text(errorDetails.tracking);
})

function getJsonFromUrl() {
  var query = location.search.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}