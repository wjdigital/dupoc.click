document.addEventListener("DOMContentLoaded", function () {

  function showSecondPopup() {
    var secondPopup = document.getElementById("second-popup");
    secondPopup.style.display = "block"; // Mostra o segundo popup
    overlay.style.display = "block"; // Mostra o overlay (se necessário)
  }

  // Função para definir um cookie
  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + ";" + expires + ";path=/";
  }

  // Função para obter o valor de um cookie
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  var popup = document.getElementById("lead-popup");
  var overlay = document.getElementById("overlay");
  var popupDisplayed = getCookie("popup_displayed");

  // Exibir popup apenas se o cookie não estiver definido
  if (!popupDisplayed) {
    popup.style.display = "block";
    overlay.style.display = "block";

    var form = document.getElementById("lead-form");
    var errorMessage = document.getElementById("error-message");
    var phoneInput = document.getElementById("phone");
    var nameInput = document.getElementById("name");

    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Previne o redirecionamento da página
      if (validateForm()) {
        var formData = new FormData(form);

        fetch("process-leads", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.text()) // Recebe a resposta como texto
          .then((text) => {
            console.log("Resposta do process-leads.php:", text);

            if (text === "exists") {
              showToast("Você já está cadastrado.", "error");
              popup.style.display = "none";
              overlay.style.display = "none";
              setCookie("popup_displayed", "true", 30); // Definir cookie
            } else if (text === "success") {
              showToast("Cadastrado com sucesso", "success");
              popup.style.display = "none";
              overlay.style.display = "none";
              setCookie("popup_displayed", "true", 30); // Definir cookie

              sendMessageAfterPopupClose(formData);
            } else if (text === "error") {
              showToast("Erro ao processar o cadastro.", "error");
            }
          })
          .catch((error) => {
            console.error("Erro:", error);
          });
      }
    });

    function validateForm() {
      const name = document.getElementById("name");
      const phone = document.getElementById("phone");

      if (!name.value.trim() || !phone.value.trim()) {
        showToast("Preencha todos os campos para efetuar o cadastro.", "error");
        return false;
      }

      if (!isValidName(name.value)) {
        showToast("O nome não pode conter números.", "error");
        return false;
      }

      const phoneValue = phone.value.replace(/\D/g, "");
      if (phoneValue.length < 10 || phoneValue.length > 11) {
        showToast(
          "Parece que o número de telefone que você inseriu não é válido. Por favor, verifique o número e tente novamente.",
          "error"
        );
        return false;
      } else {
        errorMessage.style.display = "none";
        return true;
      }
    }

    function isValidName(name) {
      return /^[A-Za-z\s]+$/.test(name);
    }

    function showToast(message, type) {
      var toast = document.createElement("li");
      toast.setAttribute("aria-live", "polite");
      toast.setAttribute("aria-atomic", "true");
      toast.setAttribute("role", "status");
      toast.setAttribute("tabindex", "0");
      toast.classList.add("group", "toast");
      toast.classList.add("data-sonner-toast");
      toast.classList.add("data-styled");
      toast.classList.add("data-mounted");
      toast.classList.add("data-visible");
      toast.classList.add("data-y-position", "bottom");
      toast.classList.add("data-x-position", "right");
      toast.classList.add("data-type", type);

      toast.style.setProperty("--index", "0");
      toast.style.setProperty("--toasts-before", "0");
      toast.style.setProperty("--z-index", "1");
      toast.style.setProperty("--offset", "0px");
      toast.style.setProperty("--initial-height", "53.5px");

      toast.innerHTML = `
                  <div data-icon>
                      ${
                        type === "error"
                          ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg>'
                          : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg>'
                      }
                  </div>
                  <div data-content>
                      <div data-title>${message}</div>
                  </div>
              `;

      document.body.appendChild(toast);
      showSecondPopup();

      setTimeout(() => {
        toast.remove();
      }, 5000);
    }

    function formatPhoneNumber(value) {
      const cleaned = ("" + value).replace(/\D/g, "");
      const maxLength = 11;
      const limited = cleaned.slice(0, maxLength);
      if (limited.length <= 2) {
        return `(${limited}`;
      } else if (limited.length <= 7) {
        return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
      } else {
        return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, maxLength)}`;
      }
    }

    phoneInput.addEventListener("input", function () {
      phoneInput.value = formatPhoneNumber(phoneInput.value);
    });

    function sendMessageAfterPopupClose(formData) {
      var phone = formData.get("phone").replace(/\D/g, "");
      var messageData = new URLSearchParams();
      messageData.append("phone", phone);

      fetch("send-message", {
        method: "POST",
        body: messageData,
      })
        .then((response) => response.text())
        .then((data) => {
          console.log("Mensagem enviada:", data);
        })
        .catch((error) => {
          console.error("Erro ao enviar mensagem:", error);
        });
    }
  }
});
