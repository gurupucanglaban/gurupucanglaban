/* =================================================
   GURU PUCANGLABAN
   KONTAK - JAVASCRIPT
================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =================================================
       TAHUN FOOTER
    ================================================= */

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    /* =================================================
       SALIN EMAIL
    ================================================= */

    const copyEmailButton =
        document.getElementById("copyEmailButton");

    if (copyEmailButton) {

        copyEmailButton.addEventListener("click", async function () {

            const email = "gurupucanglaban@gmail.com";

            try {

                await navigator.clipboard.writeText(email);

                copyEmailButton.innerHTML =
                    '<i class="fa-solid fa-check"></i> Tersalin';

                setTimeout(function () {

                    copyEmailButton.innerHTML =
                        '<i class="fa-solid fa-copy"></i> Salin Email';

                }, 1500);

            } catch (error) {

                /* Fallback untuk browser yang tidak
                   mengizinkan Clipboard API */

                const textarea =
                    document.createElement("textarea");

                textarea.value = email;

                textarea.style.position = "fixed";
                textarea.style.opacity = "0";

                document.body.appendChild(textarea);

                textarea.focus();
                textarea.select();

                try {
                    document.execCommand("copy");
                } catch (err) {
                    console.error(
                        "Gagal menyalin email:",
                        err
                    );
                }

                textarea.remove();

                copyEmailButton.innerHTML =
                    '<i class="fa-solid fa-check"></i> Tersalin';

                setTimeout(function () {

                    copyEmailButton.innerHTML =
                        '<i class="fa-solid fa-copy"></i> Salin Email';

                }, 1500);
            }

        });

    }

});