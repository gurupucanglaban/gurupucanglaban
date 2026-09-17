```javascript
/*=========================================
  GURU PUCANGLABAN v3.3
  INDEX.JS
=========================================*/


/*=========================================
  CATATAN SUPABASE
=========================================*/

/*
 * Supabase client dibuat di index.html
 *
 * Nama client:
 * indexSupabaseClient
 *
 * JANGAN menggunakan:
 * supabaseClient
 *
 * karena client tersebut tidak dibuat
 * di halaman index.
 */


/*=========================================
  FUNGSI LOGIN GOOGLE → SUPABASE
=========================================*/

async function loginGoogleToSupabase(googleCredential) {

    if (!googleCredential) {

        console.error(
            "Google credential tidak ditemukan."
        );

        throw new Error(
            "Credential Google tidak ditemukan."
        );
    }


    try {

        console.log(
            "Menukar credential Google menjadi Supabase session..."
        );


        const {
            data,
            error
        } = await indexSupabaseClient.auth.signInWithIdToken({

            provider: "google",

            token: googleCredential

        });


        if (error) {

            console.error(
                "Supabase Google Login Error:",
                error
            );

            throw error;
        }


        console.log(
            "Supabase login berhasil."
        );


        console.log(
            "Session hasil login:",
            data?.session
        );


        console.log(
            "User hasil login:",
            data?.user
        );


        /*=====================================
          PASTIKAN SESSION BENAR-BENAR TERSIMPAN
        =====================================*/

        const {
            data: sessionCheck,
            error: sessionError
        } = await indexSupabaseClient.auth.getSession();


        if (sessionError) {

            console.error(
                "Gagal membaca session:",
                sessionError
            );

            throw sessionError;
        }


        if (
            !sessionCheck ||
            !sessionCheck.session ||
            !sessionCheck.session.user
        ) {

            console.error(
                "Login Google berhasil tetapi session " +
                "Supabase belum tersedia."
            );

            throw new Error(
                "Session Supabase tidak tersedia."
            );
        }


        console.log(
            "================================"
        );


        console.log(
            "SESSION SUPABASE TERSIMPAN"
        );


        console.log(
            "EMAIL:",
            sessionCheck.session.user.email
        );


        console.log(
            "ID:",
            sessionCheck.session.user.id
        );


        console.log(
            "NAMA:",
            getIndexUserName(
                sessionCheck.session.user
            )
        );


        console.log(
            "ADMIN:",
            isIndexAdmin(
                sessionCheck.session.user
            )
        );


        console.log(
            "================================"
        );


        return {

            session:
                sessionCheck.session,

            user:
                sessionCheck.session.user

        };

    }


    catch (error) {

        console.error(
            "loginGoogleToSupabase():",
            error
        );

        throw error;
    }
}



/*=========================================
  MENDAPATKAN USER LOGIN
=========================================*/

async function getCurrentSupabaseUser() {

    try {

        if (
            typeof indexSupabaseClient ===
            "undefined"
        ) {

            console.error(
                "indexSupabaseClient tidak tersedia."
            );

            return null;
        }


        /*=====================================
          CEK SESSION
        =====================================*/

        const {
            data,
            error
        } = await indexSupabaseClient.auth.getSession();


        if (
            !error &&
            data &&
            data.session &&
            data.session.user
        ) {

            return data.session.user;
        }


        /*=====================================
          FALLBACK getUser()
        =====================================*/

        const {
            data: userData,
            error: userError
        } = await indexSupabaseClient.auth.getUser();


        if (
            !userError &&
            userData &&
            userData.user
        ) {

            return userData.user;
        }


        return null;

    }


    catch (error) {

        console.error(
            "getCurrentSupabaseUser():",
            error
        );

        return null;
    }
}



/*=========================================
  NAMA USER
=========================================*/

function getIndexUserName(user) {

    if (!user) {

        return "Tamu";
    }


    const metadata =
        user.user_metadata || {};


    return (
        metadata.full_name ||
        metadata.name ||
        metadata.preferred_username ||
        metadata.user_name ||
        (
            user.email
                ? user.email.split("@")[0]
                : "Pengguna"
        )
    );
}



/*=========================================
  CEK ADMIN
=========================================*/

function isIndexAdmin(user) {

    if (!user) {

        return false;
    }


    return (
        String(user.email || "")
            .trim()
            .toLowerCase()
        ===
        "gurupucanglaban@gmail.com"
    );
}



/*=========================================
  DOM READY
=========================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /*=====================================
          CAROUSEL
        =====================================*/

        const track =
            document.querySelector(
                ".carousel-track"
            );


        const cards =
            document.querySelectorAll(
                ".headline-card"
            );


        const prevBtn =
            document.querySelector(
                ".prev"
            );


        const nextBtn =
            document.querySelector(
                ".next"
            );


        const dots =
            document.querySelectorAll(
                ".dot"
            );


        const carousel =
            document.querySelector(
                ".carousel"
            );


        if (
            track &&
            cards.length > 0 &&
            prevBtn &&
            nextBtn &&
            carousel
        ) {

            let index = 0;


            const visibleCards = 3;


            const totalPage =
                Math.ceil(
                    cards.length /
                    visibleCards
                );


            /*=================================
              UPDATE CAROUSEL
            =================================*/

            function updateCarousel() {

                if (!cards[0]) {

                    return;
                }


                const cardWidth =
                    cards[0].offsetWidth +
                    30;


                track.style.transform =
                    "translateX(-" +
                    (
                        index *
                        cardWidth *
                        visibleCards
                    ) +
                    "px)";


                dots.forEach(
                    function (dot) {

                        dot.classList.remove(
                            "active"
                        );

                    }
                );


                if (dots[index]) {

                    dots[index].classList.add(
                        "active"
                    );
                }
            }


            /*=================================
              NEXT
            =================================*/

            nextBtn.addEventListener(
                "click",
                function () {

                    index++;


                    if (
                        index >= totalPage
                    ) {

                        index = 0;
                    }


                    updateCarousel();
                }
            );


            /*=================================
              PREV
            =================================*/

            prevBtn.addEventListener(
                "click",
                function () {

                    index--;


                    if (index < 0) {

                        index =
                            totalPage - 1;
                    }


                    updateCarousel();
                }
            );


            /*=================================
              DOT
            =================================*/

            dots.forEach(
                function (dot, i) {

                    if (
                        i >= totalPage
                    ) {

                        dot.style.display =
                            "none";

                        return;
                    }


                    dot.addEventListener(
                        "click",
                        function () {

                            index = i;

                            updateCarousel();
                        }
                    );
                }
            );


            /*=================================
              AUTO SLIDE
            =================================*/

            let autoSlide =
                setInterval(
                    moveNext,
                    5000
                );


            function moveNext() {

                index++;


                if (
                    index >= totalPage
                ) {

                    index = 0;
                }


                updateCarousel();
            }


            /*=================================
              STOP AUTO SLIDE
            =================================*/

            carousel.addEventListener(
                "mouseenter",
                function () {

                    clearInterval(
                        autoSlide
                    );
                }
            );


            /*=================================
              START AUTO SLIDE
            =================================*/

            carousel.addEventListener(
                "mouseleave",
                function () {

                    clearInterval(
                        autoSlide
                    );


                    autoSlide =
                        setInterval(
                            moveNext,
                            5000
                        );
                }
            );


            /*=================================
              SWIPE HP
            =================================*/

            let startX = 0;


            carousel.addEventListener(
                "touchstart",
                function (e) {

                    if (
                        e.touches &&
                        e.touches.length > 0
                    ) {

                        startX =
                            e.touches[0].clientX;
                    }

                },
                {
                    passive: true
                }
            );


            carousel.addEventListener(
                "touchend",
                function (e) {

                    if (
                        !e.changedTouches ||
                        e.changedTouches.length === 0
                    ) {

                        return;
                    }


                    const endX =
                        e.changedTouches[0].clientX;


                    /* Swipe kiri */

                    if (
                        startX - endX > 50
                    ) {

                        nextBtn.click();
                    }


                    /* Swipe kanan */

                    if (
                        endX - startX > 50
                    ) {

                        prevBtn.click();
                    }

                },
                {
                    passive: true
                }
            );


            /*=================================
              RESPONSIVE
            =================================*/

            window.addEventListener(
                "resize",
                updateCarousel
            );


            updateCarousel();
        }



        /*=====================================
          BACK TO TOP
        =====================================*/

        const topButton =
            document.getElementById(
                "topButton"
            );


        if (topButton) {

            window.addEventListener(
                "scroll",
                function () {

                    if (
                        window.scrollY > 300
                    ) {

                        topButton.style.display =
                            "block";

                    } else {

                        topButton.style.display =
                            "none";
                    }
                }
            );


            topButton.addEventListener(
                "click",
                function () {

                    window.scrollTo({

                        top: 0,

                        behavior: "smooth"

                    });
                }
            );
        }



        /*=====================================
          FADE UP
        =====================================*/

        const fadeItems =
            document.querySelectorAll(
                ".quick-card, " +
                ".news-card, " +
                ".video-card, " +
                ".download-card, " +
                ".stat-box"
            );


        if (
            "IntersectionObserver" in window
        ) {

            const observer =
                new IntersectionObserver(
                    function (entries) {

                        entries.forEach(
                            function (entry) {

                                if (
                                    entry.isIntersecting
                                ) {

                                    entry.target.classList.add(
                                        "show"
                                    );


                                    observer.unobserve(
                                        entry.target
                                    );
                                }
                            }
                        );

                    },
                    {
                        threshold: 0.2
                    }
                );


            fadeItems.forEach(
                function (item) {

                    item.classList.add(
                        "fade-up"
                    );


                    observer.observe(
                        item
                    );
                }
            );

        } else {

            fadeItems.forEach(
                function (item) {

                    item.classList.add(
                        "fade-up",
                        "show"
                    );
                }
            );
        }



        /*=====================================
          FORUM
        =====================================*/

        /*
         * Pemeriksaan login dilakukan
         * setelah DOM selesai dimuat.
         *
         * Ini penting supaya forumButton
         * benar-benar sudah tersedia.
         */

        const forumButton =
            document.getElementById(
                "forumButton"
            );


        if (forumButton) {

            forumButton.addEventListener(
                "click",
                async function (e) {

                    e.preventDefault();


                    console.log(
                        "================================"
                    );


                    console.log(
                        "TOMBOL FORUM DIKLIK"
                    );


                    console.log(
                        "Memeriksa Supabase Auth..."
                    );


                    try {


                        /*=================================
                          CEK CLIENT
                        =================================*/

                        if (
                            typeof indexSupabaseClient ===
                            "undefined"
                        ) {

                            console.error(
                                "indexSupabaseClient tidak tersedia."
                            );


                            alert(
                                "Supabase belum siap. " +
                                "Silakan refresh halaman."
                            );


                            return;
                        }


                        /*=================================
                          CEK SESSION
                        =================================*/

                        const {
                            data,
                            error
                        } =
                            await indexSupabaseClient.auth.getSession();


                        if (error) {

                            console.error(
                                "Gagal mengecek session:",
                                error
                            );


                            alert(
                                "Gagal memeriksa status login:\n\n" +
                                error.message
                            );


                            return;
                        }


                        let session =
                            data &&
                            data.session
                                ? data.session
                                : null;


                        let user =
                            session &&
                            session.user
                                ? session.user
                                : null;


                        console.log(
                            "SESSION INDEX:",
                            session
                        );


                        console.log(
                            "USER INDEX:",
                            user
                        );


                        /*=================================
                          FALLBACK getUser()
                        =================================*/

                        if (!user) {

                            console.log(
                                "Session belum ditemukan."
                            );


                            console.log(
                                "Mencoba getUser()..."
                            );


                            const {
                                data: userData,
                                error: userError
                            } =
                                await indexSupabaseClient.auth.getUser();


                            if (userError) {

                                console.warn(
                                    "getUser error:",
                                    userError
                                );

                            }


                            if (
                                !userError &&
                                userData &&
                                userData.user
                            ) {

                                user =
                                    userData.user;
                            }
                        }


                        /*=================================
                          USER BELUM LOGIN
                        =================================*/

                        if (!user) {

                            console.warn(
                                "USER BELUM LOGIN"
                            );


                            alert(
                                "Silakan login terlebih dahulu."
                            );


                            return;
                        }


                        /*=================================
                          SESSION ULANG
                        =================================*/

                        if (!session) {

                            const {
                                data: secondSessionData,
                                error: secondSessionError
                            } =
                                await indexSupabaseClient.auth.getSession();


                            if (
                                !secondSessionError &&
                                secondSessionData &&
                                secondSessionData.session
                            ) {

                                session =
                                    secondSessionData.session;
                            }
                        }


                        /*=================================
                          TAMPILKAN DEBUG USER
                        =================================*/

                        console.log(
                            "================================"
                        );


                        console.log(
                            "USER SUDAH LOGIN"
                        );


                        console.log(
                            "ID:",
                            user.id
                        );


                        console.log(
                            "EMAIL:",
                            user.email
                        );


                        console.log(
                            "NAMA:",
                            getIndexUserName(user)
                        );


                        console.log(
                            "ADMIN:",
                            isIndexAdmin(user)
                        );


                        console.log(
                            "SESSION ADA:",
                            !!session
                        );


                        console.log(
                            "================================"
                        );


                        /*=================================
                          PASTIKAN SESSION TERSIMPAN
                        =================================*/

                        if (!session) {

                            console.warn(
                                "User ditemukan tetapi session belum tersedia."
                            );


                            alert(
                                "Session login belum siap. " +
                                "Silakan coba buka Forum lagi."
                            );


                            return;
                        }


                        /*=================================
                          SIMPAN DATA LEGACY
                        =================================*/

                        try {

                            localStorage.setItem(
                                "googleLoggedIn",
                                "true"
                            );


                            localStorage.setItem(
                                "googleUser",
                                JSON.stringify({
                                    id: user.id,
                                    email: user.email,
                                    name: getIndexUserName(user),
                                    avatar_url:
                                        user.user_metadata?.avatar_url ||
                                        user.user_metadata?.picture ||
                                        ""
                                })
                            );

                        } catch (storageError) {

                            console.warn(
                                "Gagal menyimpan localStorage:",
                                storageError
                            );
                        }


                        /*=================================
                          BERIKAN WAKTU SESSION TERSIMPAN
                        =================================*/

                        await new Promise(
                            function (resolve) {

                                setTimeout(
                                    resolve,
                                    150
                                );
                            }
                        );


                        console.log(
                            "LOGIN VALID"
                        );


                        console.log(
                            "MEMBUKA FORUM..."
                        );


                        window.location.href =
                            "forum/forum.html";
                    }


                    catch (error) {

                        console.error(
                            "================================"
                        );


                        console.error(
                            "FORUM SESSION ERROR:",
                            error
                        );


                        console.error(
                            "================================"
                        );


                        alert(
                            "Terjadi kesalahan saat " +
                            "memeriksa login:\n\n" +
                            (
                                error &&
                                error.message
                                    ? error.message
                                    : "Kesalahan tidak diketahui."
                            )
                        );
                    }

                }
            );
        }


        else {

            console.warn(
                "Tombol forumButton tidak ditemukan."
            );
        }

    }
);



/*=========================================
  DEBUG AUTH
=========================================*/

/*
 * Mengecek status Supabase Auth
 * setelah halaman selesai dimuat.
 *
 * Tidak mengubah tampilan website.
 */

(async function debugSupabaseAuth() {

    try {

        if (
            typeof indexSupabaseClient ===
            "undefined"
        ) {

            console.error(
                "AUTH DEBUG ERROR: " +
                "indexSupabaseClient tidak tersedia."
            );


            return;
        }


        /*=================================
          CEK SESSION
        =================================*/

        const {
            data,
            error
        } =
            await indexSupabaseClient.auth.getSession();


        if (error) {

            console.error(
                "AUTH DEBUG ERROR:",
                error
            );


            return;
        }


        /*=================================
          USER DITEMUKAN
        =================================*/

        if (
            data &&
            data.session &&
            data.session.user
        ) {

            const user =
                data.session.user;


            console.log(
                "================================"
            );


            console.log(
                "SUPABASE AUTH AKTIF"
            );


            console.log(
                "User:",
                user
            );


            console.log(
                "Email:",
                user.email
            );


            console.log(
                "ID:",
                user.id
            );


            console.log(
                "Nama:",
                getIndexUserName(user)
            );


            console.log(
                "Admin:",
                isIndexAdmin(user)
            );


            console.log(
                "================================"
            );

        }


        else {

            console.log(
                "SUPABASE AUTH: BELUM LOGIN"
            );
        }

    }


    catch (error) {

        console.error(
            "AUTH DEBUG ERROR:",
            error
        );
    }

})();
```
