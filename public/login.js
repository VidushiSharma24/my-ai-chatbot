const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("name")
        .value.trim();

    const email = document.getElementById("email")
        .value.trim().toLowerCase();

    if (!name || !email) return;

    const user = {
        name: name,
        email: email
    };

    localStorage.setItem(
        "my-ai-user",
        JSON.stringify(user)
    );

    window.location.replace("/");
});