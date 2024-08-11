import { db } from './firebase.js';
import { 
    addDoc, 
    collection, 
    Timestamp, 
    getDocs, 
    deleteDoc, 
    doc, 
    updateDoc, 
    getDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Define the collection name
const COLLECTION_NAME = "fraternalsurvey.formdatas";

let currentEditingId = null;
let currentEditingCategory = null;

// Populate program names dropdown
const programNames = {
    "Faith": ["RSVP", "Church Facilities", "Catholic Schools/Seminaries", "Religious/Vocations Education", "Prayer & Study Programs", "Sacramental Gifts", "Other"],
    "Community": ["Coats For Kids", "Global Wheelchair Mission", "Habitat for Humanity", "Disaster Preparedness/Relief", "Physically Disabled/Intellectual Disabilities", "Elderly/Widow(er) Care", "Hospitals/Health Organizations", "Columbian Squires", "Scouting/Youth Groups", "Athletics", "Youth Welfare/Service", "Scholarships/Education", "Veteran Military/VAVS", "Other"],
    "Family": ["Food for Families", "Family Formation Programs", "Keep Christ in Christmas", "Family Week", "Family Prayer Night", "Other"],
    "Life": ["Special Olympics", "Marches for Life", "Ultrasound Initiative", "Pregnancy Center Support", "Christian Refugee Relief", "Memorials to Unborn Children", "Other"]
};

// Function to toggle navigation menu
function myFunction() {
    const x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

// Function to set active link based on current page
function setActiveLink() {
    const currentLocation = window.location.pathname;
    const links = document.getElementById("myTopnav")?.getElementsByTagName("a");

    if (links) {
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            if (link.href.endsWith(currentLocation)) {
                link.classList.add("active");
            }
        }
    }
}

function populateProgramNames() {
    const select = document.getElementById('program-names');
    if (select) {
        select.innerHTML = '';
        for (const [category, programs] of Object.entries(programNames)) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category;
            programs.forEach(program => {
                const option = document.createElement('option');
                option.value = program;
                option.textContent = program;
                option.setAttribute('data-category', category);
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }
    }
}

function handleOtherSelection() {
    const programSelect = document.getElementById('program-names');
    const customNameInput = document.getElementById('custom-program-name');
    
    programSelect.addEventListener('change', function() {
        if (this.value === 'Other') {
            customNameInput.style.display = 'block';
            customNameInput.required = true;
        } else {
            customNameInput.style.display = 'none';
            customNameInput.required = false;
            customNameInput.value = ''; // Clear the input when not selected
        }
    });
}

function recreateProgramSelect() {
    const inputField = document.getElementById('program-name-input');
    if (inputField) {
        const select = document.createElement('select');
        select.id = 'program-names';
        select.required = true;
        inputField.parentNode.replaceChild(select, inputField);
        populateProgramNames();
        handleOtherSelection(); // Make sure to reinitialize the "Other" option handling
    }
}

function validateCouncilNumber() {
    const councilNumberInput = document.getElementById('council-number');
    
    councilNumberInput.addEventListener('input', function(e) {
        let value = e.target.value;
        
        // Remove any non-digit characters
        value = value.replace(/\D/g, '');
        
        // Ensure it's not empty and is a positive integer
        if (value !== '' && parseInt(value) > 0) {
            e.target.value = value;
        } else {
            e.target.value = '';
        }
    });

    councilNumberInput.addEventListener('blur', function(e) {
        if (e.target.value === '') {
            e.target.setCustomValidity('Please enter a valid council number.');
        } else {
            e.target.setCustomValidity('');
        }
    });
}

// Function to handle form submission (both new entries and updates)
function setupFormHandler() {
    const form = document.getElementById('survey-form');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            console.log('Form submitted');

            const councilNumber = parseInt(document.getElementById('council-number').value);
            if (isNaN(councilNumber) || councilNumber <= 0) {
                alert('Please enter a valid council number.');
                return;
            }
            console.log(`Council Number: ${councilNumber}`);

            let name, category;
            const programNameInput = document.getElementById('program-name-input');
            if (programNameInput) {
                // We're in edit mode
                name = programNameInput.value;
                category = currentEditingCategory;
            } else {
                const programSelect = document.getElementById('program-names');
                category = programSelect.selectedOptions[0].getAttribute('data-category');
                if (programSelect.value === 'Other') {
                    const customName = document.getElementById('custom-program-name').value;
                    name = `${category} - ${customName}`;
                } else {
                    name = `${category} - ${programSelect.value}`;
                }
            }
            console.log(`Entry - Name: ${name}, Category: ${category}`);

            const dateInput = document.getElementById('program-date').value;
            const date = dateInput ? new Date(dateInput) : new Date();
            console.log(`Date: ${date}`);

            const donations = parseFloat(document.getElementById('charitable-donations').value) || 0;
            console.log(`Donations: ${donations}`);

            const hours = parseFloat(document.getElementById('service-hours').value) || 0;
            console.log(`Hours: ${hours}`);

            const data = {
                councilNumber,
                category,
                name,
                date: Timestamp.fromDate(date),
                donations,
                hours
            };
            console.log('Data to be submitted:', data);

            try {
                if (currentEditingId) {
                    console.log(`Updating existing document with ID: ${currentEditingId}`);
                    await updateDoc(doc(db, COLLECTION_NAME, currentEditingId), data);
                    console.log('Document updated successfully');
                    alert("Program updated successfully!");
                    currentEditingId = null;
                } else {
                    console.log('Adding new document');
                    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
                    console.log("Document written with ID: ", docRef.id);
                    alert("Program added successfully!");
                }

                // Reset form and recreate select dropdown
                form.reset();
                recreateProgramSelect();
                document.querySelector('#survey-form button').textContent = 'Submit Program';
                document.getElementById('generate-report').click(); // Refresh the list
            } catch (error) {
                console.error("Error submitting form: ", error);
                alert("Error submitting program. Please try again.");
            }
        };
    } else {
        console.error("Form element 'survey-form' not found");
    }
}

// Function to generate the annual survey report
function setupGenerateReportButton() {
    const generateReportButton = document.getElementById('generate-report');
    if (generateReportButton) {
        generateReportButton.addEventListener('click', async () => {
            const year = document.getElementById('survey-year').value;
            if (!year) {
                alert("Please enter a year.");
                return;
            }

            const reportContainer = document.getElementById('annual-report-container');
            reportContainer.innerHTML = '<p>Generating report...</p>';

            try {
                const q = query(
                    collection(db, COLLECTION_NAME),
                    orderBy("date", "desc")
                );

                const querySnapshot = await getDocs(q);
                
                const reportData = {
                    Faith: { programs: {}, other: { donations: 0, hours: 0 }, totalDonations: 0, totalHours: 0 },
                    Community: { programs: {}, other: { donations: 0, hours: 0 }, totalDonations: 0, totalHours: 0 },
                    Family: { programs: {}, other: { donations: 0, hours: 0 }, totalDonations: 0, totalHours: 0 },
                    Life: { programs: {}, other: { donations: 0, hours: 0 }, totalDonations: 0, totalHours: 0 }
                };

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const { category, name, donations, hours, date } = data;
                    
                    let programDate = (date instanceof Timestamp) ? date.toDate() : new Date(date);

                    if (programDate.getFullYear().toString() === year) {
                        if (programNames[category].includes(name) && name !== 'Other') {
                            if (!reportData[category].programs[name]) {
                                reportData[category].programs[name] = { donations: 0, hours: 0 };
                            }
                            reportData[category].programs[name].donations += donations;
                            reportData[category].programs[name].hours += hours;
                        } else {
                            // This is a custom program name or "Other"
                            reportData[category].other.donations += donations;
                            reportData[category].other.hours += hours;
                        }
                        reportData[category].totalDonations += donations;
                        reportData[category].totalHours += hours;
                    }
                });

                // Generate the summary report HTML
                let reportHTML = `<div class="report-section annual-survey">
                    <h2>Annual Survey of Fraternal Activity for ${year}</h2>
                    <h3>Section I: Fraternal Program Activities</h3>`;

                for (const [category, data] of Object.entries(reportData)) {
                    reportHTML += `<h4>${category} Activities</h4>`;
                    reportHTML += `<table>
                        <tr>
                            <th>Program</th>
                            <th>Charitable Disbursements</th>
                            <th>Hours of Service</th>
                        </tr>`;
                    
                    for (const [program, values] of Object.entries(data.programs)) {
                        reportHTML += `<tr>
                            <td>${program}</td>
                            <td>$${values.donations.toFixed(2)}</td>
                            <td>${values.hours.toFixed(1)}</td>
                        </tr>`;
                    }

                    // Add "Other" row if there are any custom entries
                    if (data.other.donations > 0 || data.other.hours > 0) {
                        reportHTML += `<tr>
                            <td>Miscellaneous ${category} Activities</td>
                            <td>$${data.other.donations.toFixed(2)}</td>
                            <td>${data.other.hours.toFixed(1)}</td>
                        </tr>`;
                    }

                    reportHTML += `<tr>
                        <td><strong>TOTAL ${category.toUpperCase()} CONTRIBUTIONS</strong></td>
                        <td><strong>$${data.totalDonations.toFixed(2)}</strong></td>
                        <td><strong>${data.totalHours.toFixed(1)}</strong></td>
                    </tr>`;
                    reportHTML += `</table>`;
                }

                const grandTotalDonations = Object.values(reportData).reduce((total, category) => total + category.totalDonations, 0);
                const grandTotalHours = Object.values(reportData).reduce((total, category) => total + category.totalHours, 0);
                reportHTML += `<h4>TOTAL CONTRIBUTIONS</h4>
                <p>Total Charitable Disbursements: $${grandTotalDonations.toFixed(2)}</p>
                <p>Total Hours of Service: ${grandTotalHours.toFixed(1)}</p>
                </div>`;

                reportContainer.innerHTML = reportHTML;

            } catch (error) {
                console.error("Error generating report: ", error);
                reportContainer.innerHTML = '<p>Error generating report. Please try again.</p>';
            }
        });
    }
}

// Function to delete a program
async function deleteProgram(id) {
    if (confirm("Are you sure you want to delete this program?")) {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
            alert("Program deleted successfully.");
            loadProgramEntries(); // Refresh the list
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert("Error deleting program. Please try again.");
        }
    }
}

// Function to edit a program
async function editProgram(id) {
    console.log(`Editing program with id: ${id}`);
    try {
        currentEditingId = id;
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Retrieved program data:', data);
            
            currentEditingCategory = data.category;
            console.log(`Set currentEditingCategory to: ${currentEditingCategory}`);

            document.getElementById('council-number').value = data.councilNumber || '';
            console.log(`Set council number to: ${data.councilNumber || 'Not set'}`);
            
            // Extract the program name without the category prefix
            const displayName = data.name.includes(' - ') ? data.name.split(' - ')[1] : data.name;
            
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.id = 'program-name-input';
            inputField.value = displayName;
            inputField.required = true;

            const programNamesSelect = document.getElementById('program-names');
            programNamesSelect.parentNode.replaceChild(inputField, programNamesSelect);
            console.log(`Set program name to: ${displayName}`);

            const dateValue = data.date instanceof Timestamp 
                ? data.date.toDate().toISOString().split('T')[0]
                : new Date(data.date).toISOString().split('T')[0];
            document.getElementById('program-date').value = dateValue;
            console.log(`Set program date to: ${dateValue}`);

            document.getElementById('charitable-donations').value = data.donations;
            console.log(`Set charitable donations to: ${data.donations}`);

            document.getElementById('service-hours').value = data.hours;
            console.log(`Set service hours to: ${data.hours}`);

 // Scroll to the form
            document.getElementById('council-number').scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Change submit button text
            const submitButton = document.querySelector('#survey-form button');
            if (submitButton) {
                submitButton.textContent = 'Update Program';
                console.log('Changed submit button text to "Update Program"');
            }
        } else {
            throw new Error("No such document!");
        }
    } catch (error) {
        console.error("Error in editProgram:", error);
        alert(`Error: ${error.message}. Please try again or contact support if the problem persists.`);
    }
}

// Function to toggle and display program entries
function toggleProgramEntries() {
    const entriesContainer = document.getElementById('entries-container');
    const isVisible = entriesContainer.style.display !== 'none';

    if (!isVisible) {
        entriesContainer.style.display = 'block';
        loadProgramEntries();
    } else {
        entriesContainer.style.display = 'none';
    }
}

async function loadProgramEntries() {
    const entriesContainer = document.getElementById('entries-container');
    entriesContainer.innerHTML = '<p>Loading entries...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        let entriesHTML = `<table>
            <tr>
                <th>Council Number</th>
                <th>Category</th>
                <th>Program</th>
                <th>Date</th>
                <th>Donations</th>
                <th>Hours</th>
                <th>Actions</th>
            </tr>`;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
            entriesHTML += `<tr>
                <td>${data.councilNumber}</td>
                <td>${data.category}</td>
                <td>${data.name}</td>
                <td>${date.toLocaleDateString()}</td>
                <td>$${data.donations.toFixed(2)}</td>
                <td>${data.hours.toFixed(1)}</td>
                <td>
                    <button onclick="editProgram('${doc.id}')">Edit</button>
                    <button onclick="deleteProgram('${doc.id}')">Delete</button>
                </td>
            </tr>`;
        });

        entriesHTML += `</table>`;
        entriesContainer.innerHTML = entriesHTML;
    } catch (error) {
        console.error("Error loading program entries: ", error);
        entriesContainer.innerHTML = '<p>Error loading entries. Please try again.</p>';
    }
}

// Initialize everything when the page loads
window.onload = function () {
    setActiveLink();
    populateProgramNames();
    setupFormHandler();
    handleOtherSelection();
    setupGenerateReportButton();

    // Additional code to change navbar color to blue
    const links = document.getElementById("myTopnav")?.getElementsByTagName("a");
    if (links) {
        for (let i = 0; i < links.length; i++) {
            links[i].addEventListener("click", function () {
                // Remove active class from all links
                for (let j = 0; j < links.length; j++) {
                    links[j].classList.remove("active");
                }
                // Add active class to clicked link
                this.classList.add("active");
            });
        }
    }

    // Dynamically update copyright year
    const copyrightYearElement = document.getElementById("copyright-year");
    if (copyrightYearElement) {
        copyrightYearElement.textContent = new Date().getFullYear();
    }

    // Set up event listener for toggle entries checkbox
    const toggleEntriesCheckbox = document.getElementById('toggle-entries');
    if (toggleEntriesCheckbox) {
        toggleEntriesCheckbox.addEventListener('change', toggleProgramEntries);
    }
};

// Call this function when the page loads
window.addEventListener('load', validateCouncilNumber);

// Make these functions global so they can be called from HTML
window.editProgram = editProgram;
window.deleteProgram = deleteProgram;
window.myFunction = myFunction;