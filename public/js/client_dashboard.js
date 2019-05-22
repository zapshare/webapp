// Controls the client dashboard.
//
// Fetches user information and generates dynamic content.

// JSON Web Token authentication
const jwt = localStorage.getItem('jwt');

// Fetch user's name onto the header of the page
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

// Add listener to create payment popup if pay button is clicked
function addEventListenerOnPayNow(id, booking, jwt) {
	$('body').off('click', id);
	$('body').on('click', id, (e) => {
		confirmationPopupPay("Pay Now", booking);
	});
}

// Gets the current time and formats the string.
function getTime(timeObject) {
	return timeObject.split("T")[1].split(":00.000Z")[0].replace(/^0+/, '');
}

// Creates popup for payment
function confirmationPopupPay(value, booking) {
	createPopup();
	createPopupHeader("h5", "Do you wish to pay for the booking at </br><b id='confirm-charger-address'>"
		+ booking.address + " " + booking.city + ", " + booking.province + "</b>"
		+ " on <b id='confirm-charger-date'>" + booking.startTime.split("T")[0] + "</b>"
		+ "</br>at <b id='confirm-charger-stime'>" + getTime(booking.startTime) + "-</b>"
		+ "<b>" + getTime(booking.endTime) + "</b>", "confirm-popup-subheader", "popup-subheader");
	createPopupConfirmButton("pay-now-btn", value);
	createPopupCancelButton("popup-cancel", "Cancel");
	$("body").off('click', "#pay-now-btn");
	$("body").on('click', "#pay-now-btn", () => {
		var url = '/booking/payBooking';
		const dataToSend = {
			bUID: booking.bookingID
		}
		console.log(dataToSend);

		// The Fetch call to POST payment information
		fetch(url, {
			method: 'POST',
			body: JSON.stringify(dataToSend),
			headers: {
				'content-type': 'application/json',
				'Authorization': 'Bearer ' + jwt
			}
		}).then(res => {
			console.log(res)
		}).then((response) => {

				// Informs user of success.
				$("#popup").children().not("#popup-close-button").remove();
				createPopupHeader("h3", "Payment successful!", "confirm-popup-header", "popup-header");
				$('body').on("click", (e) => {
					location.reload(true);
				})
			})
			.catch(error => console.error(error));
	});
}

// Fetches Bookings from the database and returns a string of the HTML to render
async function fetchBooking(url, status) {
	// Declare arrays containing fetched data
	let dataFromdb = [];
	let contentStrings = [];

	// Make Fetch call
	await fetch(url, {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
			'Authorization': 'Bearer ' + jwt
		}
	}).then((res) => {
		return res.json()
	}).then((db) => {
		console.log(db)
		dataFromdb = db
	}).catch(error => console.log(error));

	// Build the HTML string
	const build = () => {
		for (i = 0; i < dataFromdb.length; i++) {

			// Build-case for "Completed" and "Pending" booking types
			if (status == "completed" || status == "pending") {
				contentStrings[i] = "<div class='card-panel col-md-5'><div class='price-card-text-wrapper'>"
					+ "<div class='price-card-text-lg'>$" + dataFromdb[i].cost.toFixed(2)
					+ "</div><div class='price-card-text-sm'>" + status + "</div></div>"
					+ "<div class='card-text-lg'>" + dataFromdb[i].startTime.split("T")[0] + "</div>"
					+ "<div class='card-text-md'>" + (dataFromdb[i].startTime.split("T")[1].split(":00.000Z")[0]).replace(/^0+/, '') + "-"
					+ (dataFromdb[i].endTime.split("T")[1].split(":00.000Z")[0]).replace(/^0+/, '')
					+ ((status == "completed") ? ("</div>" + dataFromdb[i].address) : "")
					+ "<div class='card-text-sm'> Charger: " + dataFromdb[i].chargername + "</div>"
					+ "<div class='card-text-sm'>" + dataFromdb[i].city + ", " + dataFromdb[i].province + "</div>"
					+ "</div></div>";
			} 
			// Build-case for "Paid" and "Unpaid" booking types
			else {
				contentStrings[i] = "<div class='card-panel col-md-5'><div class='price-card-text-wrapper'>"
					+ "<div class='price-card-text-lg'>$" + dataFromdb[i].cost.toFixed(2)
					+ "</div><div class='price-card-text-sm "
					+ ((status == "paid") ? "green-highlight" : "orange-highlight") + "'>" + status + "</div></div>"
					+ "<div class='card-text-lg " + ((status == "paid") ? "green-highlight" : "orange-highlight") + "'>" + dataFromdb[i].startTime.split("T")[0] + "</div>"
					+ "<div class='card-text-md'>" + (dataFromdb[i].startTime.split("T")[1].split(":00.000Z")[0]).replace(/^0+/, '') + "-"
					+ (dataFromdb[i].endTime.split("T")[1].split(":00.000Z")[0]).replace(/^0+/, '') + "</div>"
					+ ((status == "paid") ? "<div class='card-text-sm'>" + dataFromdb[i].address + "</div>" : "<div class='card-text-sm'> Charger: " + dataFromdb[i].chargername + "</div>")
					+ "<div class='card-text-sm'>" + dataFromdb[i].city + ", " + dataFromdb[i].province + "</div>"
					+ ((status == "unpaid") ? ("<button id= 'payment-" + i + "' class='pay-now-btn orange-button'>Pay Now</button>") : "")
					+ "</div></div>";
				addEventListenerOnPayNow("#payment-" + i, dataFromdb[i], jwt);
			}
		}
	};
	// Clear old content and build new content
	$("#tab-content").children().remove();
	build();
	return contentStrings;
};


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

// Booking tab eventListener
const bookingTab = async (e) => {

	// Creates Confirmed Booking section for users to view

	// Instantiate containers for Confirmed Bookings
	var paidCardContainer = $("<div class='col-11 tab-section-data row'></div>");
	var confirmContainer = createContentContainer("confirmed-content", "client-confirmed-header", "Confirmed Bookings", "client-confirmed-subheader",
		"These bookings have been confirmed by the host and are ready to go!");
	confirmContainer.append(paidCardContainer);

	// Populate containers with data
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

	// Creates Pending Booking section for users to view

	// Instantiate containers for Pending Bookings
	var pendingCardContainer = $("<div class='col-11 tab-section-data row'></div>");
	var pendingContainer = createContentContainer("pending-content", "bookingHeading2", "Pending Bookings", "bookingSubHeading2"
		, "These bookings have not been confirmed by the host yet, we’ll notify you when they do!")
	pendingContainer.append(pendingCardContainer);

	// Populate containers with data
	const pendingBookingURL = "/client/pendingBookings"
	let pbDatas = await fetchBooking(pendingBookingURL, "pending");
	if (pbDatas == "") {
		nothingToDisplay(pendingCardContainer, "pending bookings");
	} else {
		pbDatas.forEach(pbData => {
			pendingCardContainer.append($(pbData));
		});
	}

	// Append content 
	$("#tab-content").append(confirmContainer);
	$("#tab-content").append(pendingContainer);
}
bookingTab();

$("#bookings-tab").click(async function (event) {	
	bookingTab();
});

// Payment tab click; build elements for payment details
$("#payments-tab").click(async function (event) {
	// Container holds all payment details for user
	var unpaidCardContainer = $("<div class='col-11 tab-section-data row'></div>");
	// General container to hold card
	var paymentContainer = createContentContainer("payment-content", "paymentHeading1", "Payment", "paymentSubHeading1"
		, "These bookings are unpaid for. Pay before the booking date!");
	paymentContainer.append(unpaidCardContainer);


	// Populate card with data.
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

// Reviews tab eventListener
$("#reviews-tab").click(async function (event) {

	// Container holds all review details for user
	var reviewContainer = createContentContainer("review-content", "reviewHeading1", "Reviews for You", "reviewSubHeading1"
		, "These are the comments of hosts that you’ve charged with.");
	var reviewCardContainer = $("<div class='col-11 tab-section-data row'></div>");
	reviewContainer.append(reviewCardContainer);
	let reviews = []

	// The Fetch request to get Review data
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
		if (reviews == "") {
			nothingToDisplay(reviewCardContainer, "reviews");
		}else{
			console.log(reviews)
			reviews.forEach(review => {
				review = $("<div class='card-panel col-md-10' id='reviewsData'>"
					+ "<div class='card-text-lg'>" + review.reviewer + "</div>"
					+ "<div class='price-card-text-wrapper price-card-text-lg'>" + review.rating + "</div>"
					+ "<div class'card-text-md'>" + review.date + "</div>"
					+ "<div class='card-text-sm'>" + review.details + "</div>"
					+ "</div>");
				reviewCardContainer.append(review)
			});
		}
		$("#tab-content").append(reviewContainer);
	}).catch(error => console.error('Error:', error));
	// if (reviews == "") {
	// 	nothingToDisplay(reviewCardContainer, "reviews");
	// } else {
		
	// 	// Currently no review system in place. This code will not render anything
	// 	reviews.forEach(review => {
	// 		review = $("<div class='card-panel col-md-10' id='reviewsData'>"
	// 			+ "<div class='card-text-lg'>" + review.reviewer + "</div>"
	// 			+ "<div class='price-card-text-wrapper price-card-text-lg'>" + review.rating + "</div>"
	// 			+ "<div class'card-text-md'>" + review.date + "</div>"
	// 			+ "<div class='card-text-sm'>" + review.details + "</div>"
	// 			+ "</div>");
	// 	});
	// }
	// Append content to tab
	// $("#tab-content").append(reviewContainer);
});

// History tab event listener
$("#history-tab").click(async function (event) {
	
	// Containers for History objects
	var historyCardContainer = $("<div class='col-11 tab-section-data row'></div>");
	var historyContainer = createContentContainer("historyContainer", "history-heading", "Booking History", "history-subheading", "These are your past bookings");
	historyContainer.append(historyCardContainer);
	
	// Await Fetch data of History
	let data = await fetch("/client/completedBookings", {
		method: 'GET',
		headers:{
			'content-type': 'application/json',
            'Authorization': 'Bearer ' + jwt
		}
	}).then((res)=>{
		return res.json()
	})

	$("#tab-content").children().remove();
	if (data.length==0) {
		nothingToDisplay(historyCardContainer, "past bookings");
	} else {
		data.forEach(booking => {
			historyCardContainer.append(renderCompletedBooking(booking));
		});
	}
	$("#tab-content").append(historyContainer);

})

function renderCompletedBooking(booking){
	let container = $("<div class='card-panel col-md completedBooking'></div>")
	let content = ""
	//right side div
	content+="<div class='price-card-text-wrapper'>"
	content+= "<div class='price-card-text-lg'>$"+booking.cost+"</div>"
	content+="<div class='price-card-text-sm'>Completed</div></div>"

	//main content
	content+="<div class='card-text-lg'>"+booking.startTime.split("T")[0]+"</div>"
	content+="<div class='card-text-md'>"+getTime(booking.startTime) + "-" + getTime(booking.endTime)+"</div>"
	content+="<div class='card-text-sm'>"+booking.client+"</div>"
	content+="<div class='card-text-sm'>Charger: "+ booking.chargername+ "</div>"
	content+="<div class='card-text-sm'>"+booking.address+"</div>"
	content+="<div class='card-text-sm'>"+booking.city+", "+booking.province+"</div>"

	container.append(content)

	$(container).on("click",function(){
		createPopup();
		createPopupHeader("h3", "Leave a review!", "review-header", "popup-header");
		let reviewDetails = $("<div id='reviewDetails' class='card-panel col-md'></div>")
		reviewDetails.append(content)

		let form = $("<form></form>")

		let rating = $("<div class='form-group'></div>")
		rating.append("<label for='ratingControlRange'><b> Rate your experience: </b></label>")
		rating.append("<input type='range' class='form-control-range' id='formControlRange' min='1'max='5' step='0.5' oninput='formControlRangeDisp.value = formControlRange.value'>")
		rating.append("<output id='formControlRangeDisp'></output>")

		let comments = $("<div class='form-group'></div>")
		comments.append("<label for='ratingControlRange'><b> Comments: </b></label> <br/>")
		comments.append("<textarea id='comments'></textarea>")
		

		let submit = $("<button type='button' id='submitBtn'>Submit Review</button>")
		submit.on("click", async(e)=>{
			e.preventDefault();
			let review = {};
			review.reviewee = booking.chargerID;
			review.details = $("#comments").val();
			review.rating = $("#formControlRange").val()
			review.date = Date.now()
			let data ={};
			data.review=review
			data.type="CHARGER"
			// console.log(data)
			await fetch('/reviews',{
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + jwt
				}})
				.then(res => console.log(res))
				.then((response) => {
					// console.log('Success: review added to db!', (response))
					// window.location.replace('/host_dashboard');
					$("#popup").children().not("#popup-close-button").remove();
					createPopupHeader("h3", "Review Submitted!", "confirm-popup-header", "popup-header");
					$('body').on("click", (e) => {
						location.reload(true);
					})
				})
				.catch(error => console.error('Error:', error));
		})

		form.append(rating,comments,submit)
		$("#popup").append(reviewDetails, form)	
	})

	return(container);
}

// Removes popup for booking
$('body').on("click", "#popup-cancel", (e) => {
    if (e.target.id == "popup-cancel") {
        $("#popup-wrapper").remove();
    }
});