document.getElementById('signupForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    console.log({ name, email, phone });


    // Prepare the data object
    const data = { name, email, phone };

    try {
        // Send the data to the backend
        const response = await fetch('http://localhost:3000/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        // Check the response
        if (response.ok) {
            document.getElementById('message').textContent = 'Thank you for joining the waitlist!';
            document.getElementById('message').style.color = 'green';
        } else {
            document.getElementById('message').textContent = 'Something went wrong. Please try again!';
            document.getElementById('message').style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').textContent = 'Error connecting to the server.';
        document.getElementById('message').style.color = 'red';
    }
});