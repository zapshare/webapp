const jwt = localStorage.getItem('jwt');
//fetch user's name onto the header of the page
fetch('/users/me', {
	method: 'GET',
	headers: {
		'content-type': 'application/json',
		'Authorization': 'Bearer ' + jwt
	}
}).then((res) => {
	return res.json()
}).then((db) => {
	$("#user-name").text(db.name.split(" ")[0] + "'s");
}).catch(error => console.log(error));


// Changes tab colours and clears tab contents
// Clearing done when switching tabs to allow for new data population
$('.tab-button').on('click', (e) => {
	$(".tab-button:not(#" + event.target.id + ")").css({ "color": "inherit" });
	$("#" + event.target.id).css({ "color": "#F05A29" });
});


//Display user message if no bookings of the specified type are found.
function nothingToDisplay(container, bookingType) {
	nothingDiv = $("<div class='no-data'><p>You don't have any " + bookingType + "!</p></div>");
	$(container).append(nothingDiv);
}

//tab's eventListener
const bookingTab = async (e) => {
	/*
	CONFIRMED BOOKING
	*/
	//general container to hold card
	var paidCardContainer = $("<div class='col-11 tab-section-data row'></div>");
	var confirmContainer = createContentContainer("confirmed-content", "client-confirmed-header", "Confirmed Bookings", "client-confirmed-subheader",
		"These bookings have been confirmed by the host and are ready to go!");
	confirmContainer.append(paidCardContainer);

	const confirmedBookingURL = "/client/paidBookings";
	let cBDatas = await fetchBooking(confirmedBookingURL, "paid");
	console.log("data:" + cBDatas);
	if (cBDatas == "") {
		nothingToDisplay(paidCardContainer, "paid bookings");
	}
	else {
		cBDatas.forEach(cBData => {
			paidCardContainer.append($(cBData));
		});
	}

	/*
	PENDING BOOKING
	*/
	//general container to hold card
	var pendingCardContainer = $("<div class='col-11 tab-section-data row'></div>");
	var pendingContainer = createContentContainer("pending-content", "bookingHeading2", "Pending Bookings", "bookingSubHeading2"
		, "These bookings have not been confirmed by the host yet, we’ll notify you when they do!")
	pendingContainer.append(pendingCardContainer);

	const pendingBookingURL = "/client/pendingBookings"
	let pbDatas = await fetchBooking(pendingBookingURL, "pending");
	if (pbDatas == "") {
		nothingToDisplay(pendingCardContainer, "pending bookings");
	} else {
		pbDatas.forEach(pbData => {
			pendingCardContainer.append($(pbData));
		});
	}

	$("#tab-content").append(confirmContainer);
	$("#tab-content").append(pendingContainer);
}
bookingTab();

$("#bookings-tab").click(async function (event) {	
	bookingTab();
});

//payment tab click; build elements for payment details
$("#payments-tab").click(async function (event) {
	//container hold all payment details for user
	//general container to hold card
	var unpaidCardContainer = $("<div class='col-11 tab-section-data row'></div>");
	var paymentContainer = createContentContainer("payment-content", "paymentHeading1", "Payment", "paymentSubHeading1"
		, "These bookings are unpaid for. Pay before the booking date!");
	paymentContainer.append(unpaidCardContainer);


	const unpaidBookingURL = "/client/unpaidBookings"
	const ubDatas = await fetchBooking(unpaidBookingURL, "unpaid");
	if (ubDatas == "") {
		nothingToDisplay(unpaidCardContainer, "unpaid bookings");
	} else {
		ubDatas.forEach(ubData => {
			unpaidCardContainer.append($(ubData));
		});
	}
	$("#tab-content").append(paymentContainer);

});

//reviews tab click; build elements for reviews details
$("#reviews-tab").click(async function (event) {

	//container hold all review details for user
	var reviewContainer = createContentContainer("review-content", "reviewHeading1", "Reviews for You", "reviewSubHeading1"
		, "These are the comments of hosts that you’ve charged with.");
	var reviewCardContainer = $("<div class='col-11 tab-section-data row'></div>");
	reviewContainer.append(reviewCardContainer);
	let reviews = []
	//fetch request
	await fetch("/client/Reviews", {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
			'Authorization': 'Bearer ' + jwt
		}
	}).then((res) => {
		return res.json()
	}).then((db) => {
		reviews = db;
		$("#tab-content").children().remove();
	}).catch(error => console.error('Error:', error));
	if (reviews == "") {
		nothingToDisplay(reviewCardContainer, "reviews");
	} else {
		// Currently no review system in place. This code will not render anything
		reviews.forEach(review => {
			review = $("<div class='card-panel col-md-10' id='reviewsData'>"
				+ "<div class='card-text-lg'>" + review.reviewer + "</div>"
				+ "<div class='price-card-text-wrapper price-card-text-lg'>" + review.rating + "</div>"
				+ "<div class'card-text-md'>" + review.date + "</div>"
				+ "<div class='card-text-sm'>" + review.details + "</div>"
				+ "</div>");
		});
	}
	$("#tab-content").append(reviewContainer);
});

$("#history-tab").click(async function (event) {

	var historyCardContainer = $("<div class='col-11 tab-section-data row'></div>");
	var historyContainer = createContentContainer("historyContainer", "history-heading", "Booking History", "history-subheading", "These are your past bookings");
	historyContainer.append(historyCardContainer);

	let hDatas = await fetchBooking("/client/completedBookings", "completed");
	if (hDatas == "") {
		nothingToDisplay(historyCardContainer, "past bookings");
	} else {
		hDatas.forEach(hData => {
			historyCardContainer.append($(hData));
		});
	}
	$("#tab-content").append(historyContainer);

})

