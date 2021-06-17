document.addEventListener("DOMContentLoaded", () => {
  let error = document.querySelector("#error");
  let username = document.querySelector("#username");
  let password = document.querySelector("#password");
  let submitButton = document.querySelector("#submit-button");
  let form = document.querySelector("form");
  let errorTimeout;

  username.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      submitForm();
    }
  });

  password.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      submitForm();
    }
  });

  username.addEventListener("input", () => {
    submitButton.disabled = !(username.value.length > 0 && password.value.length > 0);
  });

  password.addEventListener("input", () => {
    submitButton.disabled = !(username.value.length > 0 && password.value.length > 0);
  });

  submitButton.addEventListener("click", () => {
    submitForm();
  });

  function messageGenerator(arr) {
    let lastRandom = -1;
    return () => {
      let random = Math.floor(Math.random() * arr.length);
      while (random === lastRandom) random = Math.floor(Math.random() * arr.length);
      lastRandom = random;
      return arr[random];
    };
  }

  let invalidError = messageGenerator([
    "You are not trying to brute force your way in right 😕",
    "Invalid credentials 🤖",
    "Dont you worry you might have just mistyped something 🙂",
    "That didn't quite hit the mark 🙄",
    "You shall not pass 🎩",
    "Well at least you tried 😔"
  ]);

  let serverError = messageGenerator([
    "Well the server is kinda down at the moment, check back later 🙄",
    "I'm not feeling too well 🤢",
    "Internal server error 🤖",
    "All dizzy I'm going crazy 😵"
  ]);

  async function submitForm() {
    if (username.value.length == 0 || password.value.length == 0) return;

    try {
      let result = await (await fetch("/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `{"username": "${username.value}", "password": "${password.value}"}`
      })).text();

      if (result === "true") {
        error.classList.remove("visible");
        form.submit();
      } else {
        showError(invalidError());
        username.focus();
        username.select();
      }
    } catch (err) {
      showError(serverError());
    }
  }

  function showError(message) {
    error.classList.remove("visible");
    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => {
      error.classList.add("visible");
      error.innerHTML = message;
    }, 250);
  }
});
