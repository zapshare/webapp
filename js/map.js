$(document).ready(function() {
    $("#map-horizontal-expansion-button").on("click", () => {
        console.log("horizontal");
        $("#map-side-content").toggleClass("map-side-expanded");
        $("#map-horizontal-expansion-button").toggleClass("fa-chevron-right fa-chevron-left");
        $("#map-vertical-expansion-button").toggleClass("fa-chevron-up fa-chevron-down");
    });
    $("#map-vertical-expansion-button").on("click", () => {
        console.log("vertical");
        $("#map-side-content").toggleClass("map-side-expanded");
        $("#map-horizontal-expansion-button").toggleClass("fa-chevron-right fa-chevron-left");
        $("#map-vertical-expansion-button").toggleClass("fa-chevron-up fa-chevron-down");
    });
});