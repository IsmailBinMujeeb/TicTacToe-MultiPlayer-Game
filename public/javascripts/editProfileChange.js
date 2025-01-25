document.addEventListener("DOMContentLoaded", () => {
    const profilePicInput = document.getElementById("profile-pic-input");
    const profilePicImg = document.querySelector(".profile-picture img");
    const profilePicLabel = document.querySelector(".profile-picture label");

    profilePicInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                profilePicImg.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });

    profilePicLabel.addEventListener("click", () => {
        event.preventDefault();
        profilePicInput.click();
    });
});