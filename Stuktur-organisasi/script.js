/* =========================================================
   GURU PUCANGLABAN
   STRUKTUR ORGANISASI.JS
========================================================= */


/* =========================================================
   MOBILE MENU
========================================================= */

const mobileMenuButton =
    document.getElementById(
        "mobileMenuButton"
    );

const mainNav =
    document.getElementById(
        "mainNav"
    );


if (
    mobileMenuButton &&
    mainNav
) {

    mobileMenuButton.addEventListener(
        "click",
        function() {

            mainNav.classList.toggle(
                "open"
            );


            const icon =
                mobileMenuButton.querySelector(
                    "i"
                );


            if (
                mainNav.classList.contains(
                    "open"
                )
            ) {

                icon.className =
                    "fa-solid fa-xmark";

            }
            else {

                icon.className =
                    "fa-solid fa-bars";

            }

        }
    );

}


/* =========================================================
   TUTUP MENU KETIKA LINK DIPILIH
========================================================= */

if (mainNav) {

    mainNav
        .querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function() {

                        mainNav.classList.remove(
                            "open"
                        );


                        const icon =
                            mobileMenuButton?.querySelector(
                                "i"
                            );


                        if (icon) {

                            icon.className =
                                "fa-solid fa-bars";

                        }

                    }
                );

            }
        );

}


/* =========================================================
   TUTUP MENU KETIKA KLIK DI LUAR
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            !mainNav ||
            !mobileMenuButton
        ) {
            return;
        }


        if (
            !mainNav.contains(event.target) &&
            !mobileMenuButton.contains(event.target)
        ) {

            mainNav.classList.remove(
                "open"
            );


            const icon =
                mobileMenuButton.querySelector(
                    "i"
                );


            if (icon) {

                icon.className =
                    "fa-solid fa-bars";

            }

        }

    }
);


/* =========================================================
   TAHUN FOOTER
========================================================= */

const currentYear =
    document.getElementById(
        "currentYear"
    );


if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}


/* =========================================================
   SCROLL REVEAL SEDERHANA
========================================================= */

const animatedElements =
    document.querySelectorAll(
        ".organization-card, .management-card, .division-card, .intro-card, .info-card"
    );


if (
    "IntersectionObserver" in window
) {

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.08
            }
        );


    animatedElements.forEach(
        element => {

            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "GURU PUCANGLABAN - Struktur Organisasi siap."
);