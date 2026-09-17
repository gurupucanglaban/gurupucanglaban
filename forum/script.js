/* =========================================================
   GURU PUCANGLABAN
   FORUM.JS FINAL v3
   =========================================================

   AUTH:
   - Supabase Auth session sinkron dengan index.html
   - getSession() + getUser() fallback
   - currentUser menjadi sumber utama status login
   - Tidak mudah kembali menjadi Tamu
   - Nama Google
   - Email Google
   - Foto Google
   - Admin berdasarkan Auth email

   ADMIN:
   gurupucanglaban@gmail.com

   FITUR:
   - Posting
   - Foto max 1 MB
   - File max 3 MB
   - Maksimal 1 foto + 1 file
   - Suka
   - Tidak Suka
   - Komentar
   - Bagikan
   - WhatsApp
   - Facebook
   - Telegram
   - X
   - LinkedIn
   - Reddit
   - Email
   - Salin link
   - Share bawaan perangkat
   - Edit posting
   - Hapus posting
   - Admin edit posting semua user
   - Admin hapus posting semua user
   - Edit komentar sendiri
   - Hapus komentar sendiri
   - Admin edit komentar semua user
   - Admin hapus komentar semua user
   - Storage cleanup
========================================================= */


/* =========================================================
   1. SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://wzitaorxesesxlcpulat.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_zbr4IVpzJJI1HwOERq_h7g_SKi2h9tg";

const STORAGE_BUCKET =
    "forum";

const ADMIN_EMAIL =
    "gurupucanglaban@gmail.com";

const MAX_PHOTO_SIZE =
    1 * 1024 * 1024;

const MAX_FILE_SIZE =
    3 * 1024 * 1024;

const FALLBACK_USER_PHOTO =
    "../images/tamu.jpeg";


/* =========================================================
   2. SUPABASE CLIENT
========================================================= */

if (
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
) {

    console.error(
        "Supabase JS belum tersedia."
    );

    throw new Error(
        "Supabase JS belum dimuat sebelum forum.js."
    );

}


const FORUM_AUTH_STORAGE_KEY =
    "sb-wzitaorxesesxlcpulat-auth-token";

const forumSupabaseClient =
    window.__GURU_PUCANGLABAN_SUPABASE__ ||
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storage: window.localStorage,
                storageKey: FORUM_AUTH_STORAGE_KEY
            }
        }
    );

if (!window.__GURU_PUCANGLABAN_SUPABASE__) {
    window.__GURU_PUCANGLABAN_SUPABASE__ = forumSupabaseClient;
}


/* =========================================================
   3. STATE
========================================================= */

let currentUser = null;
let currentSession = null;
let currentUserProfile = null;
let isAdmin = false;
let authReady = false;

let allPosts = [];
let visibleComments = {};

let selectedPhoto = null;
let selectedFile = null;

let postsLoadingInProgress = false;
let authProcessingInProgress = false;


/* =========================================================
   4. ELEMENT
========================================================= */

const navbarUser =
    document.getElementById("navbarUser");

const userPhoto =
    document.getElementById("userPhoto");

const userName =
    document.getElementById("userName");

const loginInfo =
    document.getElementById("loginInfo");

const createUserPhoto =
    document.getElementById("createUserPhoto");

const createUserName =
    document.getElementById("createUserName");

const createUserInfo =
    document.getElementById("createUserInfo");

const createPost =
    document.getElementById("createPost");

const postText =
    document.getElementById("postText");

const photoInput =
    document.getElementById("photoInput");

const fileInput =
    document.getElementById("fileInput");

const filePreview =
    document.getElementById("filePreview");

const postButton =
    document.getElementById("postButton");

const postsContainer =
    document.getElementById("postsContainer");

const postsLoading =
    document.getElementById("postsLoading");

const loginModal =
    document.getElementById("loginModal");

const closeLoginModal =
    document.getElementById("closeLoginModal");

const loginButton =
    document.getElementById("loginButton");


/* =========================================================
   5. NORMALISASI EMAIL
========================================================= */

function normalizeEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();

}


/* =========================================================
   6. ADMIN
   ADMIN HANYA BERDASARKAN AUTH EMAIL
========================================================= */

function isAdminAccount(user) {

    if (!user) {
        return false;
    }

    return (
        normalizeEmail(user.email) ===
        normalizeEmail(ADMIN_EMAIL)
    );

}


/* =========================================================
   7. ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   8. AVATAR
========================================================= */

function setAvatar(
    element,
    photo,
    name
) {

    if (!element) {
        return;
    }

    element.alt =
        name || "Pengguna";

    element.onerror =
        function() {

            this.onerror = null;

            this.src =
                FALLBACK_USER_PHOTO;

        };

    element.src =
        photo || FALLBACK_USER_PHOTO;

}


/* =========================================================
   9. NAMA USER
========================================================= */

function getUserName(user) {

    if (!user) {
        return "Tamu";
    }

    const metadata =
        user.user_metadata || {};

    const nama =
        metadata.full_name ||
        metadata.name ||
        metadata.preferred_username ||
        metadata.user_name;

    if (nama) {
        return String(nama).trim();
    }

    if (user.email) {

        const emailName =
            user.email
                .split("@")[0]
                .trim();

        if (emailName) {
            return emailName;
        }

    }

    return "Pengguna";

}


/* =========================================================
   10. FOTO USER
========================================================= */

function getUserPhoto(user) {

    if (!user) {
        return FALLBACK_USER_PHOTO;
    }

    const metadata =
        user.user_metadata || {};

    return (
        metadata.avatar_url ||
        metadata.picture ||
        metadata.photo_url ||
        metadata.image_url ||
        FALLBACK_USER_PHOTO
    );

}


/* =========================================================
   11. LOADING USER
========================================================= */

function showLoadingUser() {

    if (userName) {
        userName.textContent =
            "Memuat akun...";
    }

    if (loginInfo) {
        loginInfo.textContent =
            "Memeriksa akun Google...";
    }

    if (createUserName) {
        createUserName.textContent =
            "Memuat akun...";
    }

    if (createUserInfo) {
        createUserInfo.textContent =
            "Memeriksa akun Google...";
    }

    setAvatar(
        userPhoto,
        FALLBACK_USER_PHOTO,
        "Memuat akun"
    );

    setAvatar(
        createUserPhoto,
        FALLBACK_USER_PHOTO,
        "Memuat akun"
    );

}


/* =========================================================
   12. UPDATE USER INTERFACE
========================================================= */

function updateUserInterface() {

    if (!authReady) {

        showLoadingUser();

        return;
    }


    /* =====================================================
       BELUM LOGIN
    ===================================================== */

    if (!currentUser) {

        setAvatar(
            userPhoto,
            FALLBACK_USER_PHOTO,
            "Tamu"
        );

        if (userName) {
            userName.textContent =
                "Tamu";
        }

        if (loginInfo) {
            loginInfo.textContent =
                "Silakan login";
        }

        setAvatar(
            createUserPhoto,
            FALLBACK_USER_PHOTO,
            "Tamu"
        );

        if (createUserName) {
            createUserName.textContent =
                "Tamu";
        }

        if (createUserInfo) {
            createUserInfo.textContent =
                "Silakan login untuk membuat postingan";
        }

        return;
    }


    /* =====================================================
       USER SUDAH LOGIN
    ===================================================== */

    const nama =
        getUserName(currentUser);

    const email =
        currentUser.email || "";

    const foto =
        getUserPhoto(currentUser);


    setAvatar(
        userPhoto,
        foto,
        nama
    );

    if (userName) {
        userName.textContent =
            nama;
    }

    if (loginInfo) {

        loginInfo.textContent =
            isAdmin
                ? `${email} • Admin`
                : email;

    }


    setAvatar(
        createUserPhoto,
        foto,
        nama
    );

    if (createUserName) {
        createUserName.textContent =
            nama;
    }

    if (createUserInfo) {

        createUserInfo.textContent =
            isAdmin
                ? `${email} • Admin`
                : email;

    }

}


/* =========================================================
   13. AKSES FORM POST
========================================================= */

function updatePostAccess() {

    const loggedIn =
        !!currentUser;

    if (postText) {

        postText.disabled =
            !loggedIn;

        postText.placeholder =
            loggedIn
                ? "Apa yang ingin Anda bagikan?"
                : "Silakan login terlebih dahulu.";

    }

    if (postButton) {

        postButton.disabled =
            !loggedIn;

    }

    if (photoInput) {

        photoInput.disabled =
            !loggedIn;

    }

    if (fileInput) {

        fileInput.disabled =
            !loggedIn;

    }

    if (createPost) {

        createPost.classList.toggle(
            "login-required",
            !loggedIn
        );

    }

}


/* =========================================================
   14. LOGIN MODAL
========================================================= */

function showLoginModal() {

    if (!loginModal) {
        return;
    }

    loginModal.style.display =
        "flex";

    loginModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function hideLoginModal() {

    if (!loginModal) {
        return;
    }

    loginModal.style.display =
        "none";

    loginModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   15. REQUIRE LOGIN
========================================================= */

function requireLogin() {

    if (currentUser) {
        return true;
    }

    showLoginModal();

    return false;

}


/* =========================================================
   16. SYNC USER PROFILE
========================================================= */

async function syncUserProfile() {

    if (!currentUser) {
        return;
    }

    const nama =
        getUserName(currentUser);

    const email =
        currentUser.email || "";

    const normalizedEmail =
        normalizeEmail(email);

    const foto =
        getUserPhoto(currentUser);

    const roleToSave =
        normalizedEmail ===
        normalizeEmail(ADMIN_EMAIL)
            ? "admin"
            : "user";

    try {

        const { error } =
            await forumSupabaseClient
                .from("users")
                .upsert(
                    {
                        id:
                            currentUser.id,

                        email:
                            email,

                        name:
                            nama,

                        avatar_url:
                            foto === FALLBACK_USER_PHOTO
                                ? null
                                : foto,

                        role:
                            roleToSave,

                        last_login:
                            new Date().toISOString()
                    },
                    {
                        onConflict:
                            "id"
                    }
                );

        if (error) {

            console.warn(
                "PROFILE UPSERT ERROR:",
                error
            );

            return;
        }

        console.log(
            "PROFILE DISINKRONKAN:",
            email,
            roleToSave
        );

    }
    catch (error) {

        console.warn(
            "SYNC PROFILE ERROR:",
            error
        );

    }

}


/* =========================================================
   17. LOAD PROFILE
========================================================= */

async function loadUserProfile() {

    if (!currentUser) {

        currentUserProfile =
            null;

        isAdmin =
            false;

        return;

    }

    try {

        const { data, error } =
            await forumSupabaseClient
                .from("users")
                .select(
                    "id,email,name,avatar_url,role"
                )
                .eq(
                    "id",
                    currentUser.id
                )
                .maybeSingle();

        if (error) {

            console.warn(
                "LOAD PROFILE ERROR:",
                error
            );

            currentUserProfile =
                null;

            isAdmin =
                isAdminAccount(
                    currentUser
                );

            return;

        }

        currentUserProfile =
            data || null;

        isAdmin =
            isAdminAccount(
                currentUser
            );

    }
    catch (error) {

        console.warn(
            "PROFILE ERROR:",
            error
        );

        currentUserProfile =
            null;

        isAdmin =
            isAdminAccount(
                currentUser
            );

    }

}


/* =========================================================
   18. RESOLVE AUTH STATE
========================================================= */

async function resolveAuthState() {

    let session = null;
    let user = null;
    let sessionReadSuccessful = false;
    let userReadSuccessful = false;

    try {

        const {
            data,
            error
        } = await forumSupabaseClient.auth.getSession();

        if (error) {

            console.warn(
                "GET SESSION ERROR:",
                error
            );

        }
        else {

            sessionReadSuccessful = true;
            session = data?.session || null;
            user = session?.user || null;

        }

    }
    catch (error) {

        console.warn(
            "GET SESSION EXCEPTION:",
            error
        );

    }

    if (!user) {

        try {

            const {
                data,
                error
            } = await forumSupabaseClient.auth.getUser();

            if (error) {

                console.warn(
                    "GET USER ERROR:",
                    error
                );

            }
            else {

                userReadSuccessful = true;
                user = data?.user || null;

            }

        }
        catch (error) {

            console.warn(
                "GET USER EXCEPTION:",
                error
            );

        }

    }

    if (user && !session) {

        try {

            const {
                data,
                error
            } = await forumSupabaseClient.auth.getSession();

            if (!error) {

                sessionReadSuccessful = true;
                session = data?.session || null;

            }

        }
        catch (error) {

            console.warn(
                "SECOND GET SESSION ERROR:",
                error
            );

        }

    }

    if (user) {

        currentSession = session;
        currentUser = user;

    }
    else if (
        sessionReadSuccessful &&
        userReadSuccessful
    ) {

        currentSession = null;
        currentUser = null;

    }
    else if (!currentUser) {

        currentSession = null;
        currentUser = null;

    }

    isAdmin =
        currentUser
            ? isAdminAccount(currentUser)
            : false;

    if (currentUser) {

        try {

            await syncUserProfile();
            await loadUserProfile();

        }
        catch (error) {

            console.warn(
                "PROFILE PROCESS ERROR:",
                error
            );

        }

        isAdmin =
            isAdminAccount(
                currentUser
            );

    }
    else {

        currentUserProfile = null;
        isAdmin = false;

    }

    return {
        session:
            currentSession,
        user:
            currentUser
    };

}


/* =========================================================
   19. APPLY AUTH STATE
========================================================= */

async function applyAuthState() {

    if (authProcessingInProgress) {
        return;
    }

    authProcessingInProgress =
        true;

    try {

        await resolveAuthState();

    }
    catch (error) {

        console.error(
            "APPLY AUTH STATE ERROR:",
            error
        );

        if (!currentUser) {

            currentSession =
                null;

            currentUserProfile =
                null;

            isAdmin =
                false;

        }

    }
    finally {

        authProcessingInProgress =
            false;

    }


    authReady =
        true;

    updateUserInterface();

    updatePostAccess();

}


/* =========================================================
   20. CHECK SESSION
========================================================= */

async function checkSession() {

    console.log(
        "========================================"
    );

    console.log(
        "MEMERIKSA AUTH SUPABASE FORUM..."
    );

    try {

        await applyAuthState();

        console.log(
            "AUTH USER:",
            currentUser
                ? currentUser.email
                : "TIDAK ADA"
        );

        console.log(
            "AUTH NAME:",
            currentUser
                ? getUserName(currentUser)
                : "Tamu"
        );

        console.log(
            "AUTH ADMIN:",
            isAdmin
        );

        console.log(
            "AUTH SESSION:",
            !!currentSession
        );

    }
    catch (error) {

        console.error(
            "CHECK SESSION ERROR:",
            error
        );

        if (!currentUser) {

            currentSession =
                null;

            currentUser =
                null;

            currentUserProfile =
                null;

            isAdmin =
                false;

        }

        authReady =
            true;

        updateUserInterface();

        updatePostAccess();

    }

    console.log(
        "========================================"
    );

}


/* =========================================================
   21. AUTH STATE CHANGE
========================================================= */

forumSupabaseClient.auth.onAuthStateChange(
    function(event, session) {

        console.log(
            "AUTH EVENT:",
            event,
            session?.user?.email || "NO USER"
        );

        if (event === "SIGNED_OUT") {

            currentSession = null;
            currentUser = null;
            currentUserProfile = null;
            isAdmin = false;
            authReady = true;

            updateUserInterface();
            updatePostAccess();
            loadPosts();

            return;
        }

        if (session?.user) {

            currentSession = session;
            currentUser = session.user;
            isAdmin = isAdminAccount(currentUser);
            authReady = true;

            updateUserInterface();
            updatePostAccess();

        }

        setTimeout(
            async function() {

                try {

                    await applyAuthState();
                    await loadPosts();

                }
                catch (error) {

                    console.error(
                        "AUTH EVENT PROCESS ERROR:",
                        error
                    );

                    if (currentUser) {

                        authReady = true;
                        isAdmin = isAdminAccount(currentUser);
                        updateUserInterface();
                        updatePostAccess();

                    }

                }

            },
            0
        );

    }
);


/* =========================================================
   22. LOGIN BUTTON
========================================================= */

if (loginButton) {

    loginButton.addEventListener(
        "click",
        function() {

            hideLoginModal();

            window.location.href =
                "../index.html";

        }
    );

}


if (closeLoginModal) {

    closeLoginModal.addEventListener(
        "click",
        hideLoginModal
    );

}


if (loginModal) {

    loginModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                loginModal
            ) {

                hideLoginModal();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            hideLoginModal();

            closeAllShareMenus();

        }

    }
);


/* =========================================================
   23. VALIDASI FOTO
========================================================= */

function validatePhoto(file) {

    if (!file) {
        return false;
    }

    if (
        !file.type.startsWith("image/")
    ) {

        alert(
            "File yang dipilih bukan gambar."
        );

        return false;

    }

    if (
        file.size >
        MAX_PHOTO_SIZE
    ) {

        alert(
            "Ukuran foto maksimal 1 MB."
        );

        return false;

    }

    return true;

}


/* =========================================================
   24. VALIDASI FILE
========================================================= */

function validateFile(file) {

    if (!file) {
        return false;
    }

    if (
        file.size >
        MAX_FILE_SIZE
    ) {

        alert(
            "Ukuran file maksimal 3 MB."
        );

        return false;

    }

    return true;

}


/* =========================================================
   25. INPUT FOTO
========================================================= */

if (photoInput) {

    photoInput.addEventListener(
        "change",
        function() {

            const file =
                this.files?.[0];

            if (!file) {

                selectedPhoto =
                    null;

                renderFilePreview();

                return;

            }

            if (
                !validatePhoto(file)
            ) {

                this.value =
                    "";

                selectedPhoto =
                    null;

                renderFilePreview();

                return;

            }

            selectedPhoto =
                file;

            renderFilePreview();

        }
    );

}


/* =========================================================
   26. INPUT FILE
========================================================= */

if (fileInput) {

    fileInput.addEventListener(
        "change",
        function() {

            const file =
                this.files?.[0];

            if (!file) {

                selectedFile =
                    null;

                renderFilePreview();

                return;

            }

            if (
                !validateFile(file)
            ) {

                this.value =
                    "";

                selectedFile =
                    null;

                renderFilePreview();

                return;

            }

            selectedFile =
                file;

            renderFilePreview();

        }
    );

}


/* =========================================================
   27. FILE PREVIEW
========================================================= */

function renderFilePreview() {

    if (!filePreview) {
        return;
    }

    filePreview.innerHTML =
        "";


    if (selectedPhoto) {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "selected-file";

        div.innerHTML = `
            <i class="fa-solid fa-image"></i>
            <span>${escapeHtml(selectedPhoto.name)}</span>
            <small>${(
                selectedPhoto.size / 1024
            ).toFixed(1)} KB</small>
        `;

        filePreview.appendChild(
            div
        );

    }


    if (selectedFile) {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "selected-file";

        div.innerHTML = `
            <i class="fa-solid fa-file"></i>
            <span>${escapeHtml(selectedFile.name)}</span>
            <small>${(
                selectedFile.size / 1024
            ).toFixed(1)} KB</small>
        `;

        filePreview.appendChild(
            div
        );

    }

}


/* =========================================================
   28. UPLOAD STORAGE
========================================================= */

async function uploadToStorage(
    file,
    folder
) {

    if (
        !file ||
        !currentUser
    ) {

        return null;

    }

    const extension =
        file.name.includes(".")
            ? "." +
              file.name
                  .split(".")
                  .pop()
                  .toLowerCase()
            : "";

    const filePath =
        `${currentUser.id}/${folder}/${crypto.randomUUID()}${extension}`;


    const { error } =
        await forumSupabaseClient
            .storage
            .from(STORAGE_BUCKET)
            .upload(
                filePath,
                file,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false
                }
            );

    if (error) {
        throw error;
    }


    const { data } =
        forumSupabaseClient
            .storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(
                filePath
            );


    return {
        path:
            filePath,

        url:
            data?.publicUrl || ""
    };

}


/* =========================================================
   29. CLEANUP STORAGE
========================================================= */

async function cleanupUploadedFiles(
    paths
) {

    const validPaths =
        [
            ...new Set(
                (paths || [])
                    .filter(
                        path =>
                            typeof path === "string"
                    )
                    .map(
                        path =>
                            path.trim()
                    )
                    .filter(Boolean)
            )
        ];


    if (!validPaths.length) {

        return {
            success:
                true,

            error:
                null
        };

    }


    try {

        console.log(
            "MENGHAPUS STORAGE:",
            validPaths
        );


        const {
            data,
            error
        } =
            await forumSupabaseClient
                .storage
                .from(STORAGE_BUCKET)
                .remove(
                    validPaths
                );


        if (error) {

            console.error(
                "STORAGE DELETE ERROR:",
                error
            );

            return {
                success:
                    false,

                error:
                    error
            };

        }


        console.log(
            "STORAGE BERHASIL DIHAPUS:",
            data || validPaths
        );


        return {
            success:
                true,

            error:
                null
        };

    }
    catch (error) {

        console.error(
            "STORAGE DELETE EXCEPTION:",
            error
        );

        return {
            success:
                false,

            error:
                error
        };

    }

}


/* =========================================================
   30. POST BUTTON
========================================================= */

if (postButton) {

    postButton.addEventListener(
        "click",
        createPostHandler
    );

}


/* =========================================================
   31. CREATE POST
========================================================= */

async function createPostHandler() {

    if (!requireLogin()) {
        return;
    }


    const text =
        postText?.value.trim() ||
        "";


    if (
        !text &&
        !selectedPhoto &&
        !selectedFile
    ) {

        alert(
            "Silakan tulis sesuatu atau pilih foto/file."
        );

        return;

    }


    const originalText =
        postButton.innerHTML;


    let photoData =
        null;

    let fileData =
        null;


    try {

        postButton.disabled =
            true;

        postButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Mengirim...
        `;


        if (selectedPhoto) {

            photoData =
                await uploadToStorage(
                    selectedPhoto,
                    "images"
                );

        }


        if (selectedFile) {

            fileData =
                await uploadToStorage(
                    selectedFile,
                    "files"
                );

        }


        const {
            data,
            error
        } =
            await forumSupabaseClient
                .from("posts")
                .insert(
                    {
                        user_id:
                            currentUser.id,

                        content:
                            text,

                        image_url:
                            photoData?.url ||
                            null,

                        file_url:
                            fileData?.url ||
                            null,

                        file_name:
                            selectedFile?.name ||
                            null,

                        image_path:
                            photoData?.path ||
                            null,

                        file_path:
                            fileData?.path ||
                            null
                    }
                )
                .select()
                .single();


        if (error) {

            await cleanupUploadedFiles(
                [
                    photoData?.path,
                    fileData?.path
                ]
            );

            throw error;

        }


        console.log(
            "POST BERHASIL:",
            data
        );


        resetPostForm();

        await loadPosts();

    }
    catch (error) {

        console.error(
            "CREATE POST ERROR:",
            error
        );

        alert(
            "Posting gagal:\n\n" +
            (
                error?.message ||
                "Terjadi kesalahan."
            )
        );

    }
    finally {

        postButton.disabled =
            !currentUser;

        postButton.innerHTML =
            originalText;

    }

}


/* =========================================================
   32. RESET POST FORM
========================================================= */

function resetPostForm() {

    if (postText) {
        postText.value =
            "";
    }

    if (photoInput) {
        photoInput.value =
            "";
    }

    if (fileInput) {
        fileInput.value =
            "";
    }

    selectedPhoto =
        null;

    selectedFile =
        null;

    if (filePreview) {
        filePreview.innerHTML =
            "";
    }

}


/* =========================================================
   33. LOAD POSTS
========================================================= */

async function loadPosts() {

    if (!postsContainer) {
        return;
    }


    if (postsLoadingInProgress) {
        return;
    }

    postsLoadingInProgress =
        true;


    if (postsLoading) {
        postsLoading.style.display =
            "block";
    }


    try {

        const {
            data,
            error
        } =
            await forumSupabaseClient
                .from("posts")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                );


        if (error) {
            throw error;
        }


        allPosts =
            data || [];


        await renderPosts();

    }
    catch (error) {

        console.error(
            "LOAD POSTS ERROR:",
            error
        );

        postsContainer.innerHTML = `
            <div class="forum-error">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Postingan belum dapat dimuat.</p>
            </div>
        `;

    }
    finally {

        postsLoadingInProgress =
            false;

        if (postsLoading) {
            postsLoading.style.display =
                "none";
        }

    }

}


/* =========================================================
   34. FORMAT DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return date.toLocaleString(
        "id-ID",
        {
            day:
                "2-digit",

            month:
                "long",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


/* =========================================================
   35. GET POST PROFILES
========================================================= */

async function getPostProfiles(
    posts
) {

    const ids =
        [
            ...new Set(
                posts
                    .map(
                        post =>
                            post.user_id
                    )
                    .filter(Boolean)
            )
        ];


    if (!ids.length) {
        return {};
    }


    const {
        data,
        error
    } =
        await forumSupabaseClient
            .from("users")
            .select(
                "id,name,email,avatar_url,role"
            )
            .in(
                "id",
                ids
            );


    if (error) {

        console.warn(
            "PROFILE POSTS ERROR:",
            error
        );

        return {};

    }


    const profiles =
        {};


    (data || []).forEach(
        profile => {

            profiles[
                profile.id
            ] = profile;

        }
    );


    return profiles;

}


/* =========================================================
   36. RENDER POSTS
========================================================= */

async function renderPosts() {

    if (!postsContainer) {
        return;
    }


    if (!allPosts.length) {

        postsContainer.innerHTML = `
            <div class="forum-empty">
                <i class="fa-solid fa-comments"></i>
                <p>Belum ada postingan.</p>
            </div>
        `;

        return;

    }


    const profiles =
        await getPostProfiles(
            allPosts
        );


    postsContainer.innerHTML =
        "";


    for (
        const post
        of allPosts
    ) {

        const profile =
            profiles[
                post.user_id
            ] || {};


        const card =
            await createPostElement(
                post,
                profile
            );


        postsContainer.appendChild(
            card
        );

    }

}


/* =========================================================
   37. CREATE POST CARD
========================================================= */

async function createPostElement(
    post,
    profile
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "post-card";


    card.dataset.postId =
        post.id;


    card.id =
        `post-${post.id}`;


    const nama =
        profile.name ||
        (
            profile.email
                ? profile.email.split("@")[0]
                : "Pengguna"
        );


    const foto =
        profile.avatar_url ||
        FALLBACK_USER_PHOTO;


    const canManage =
        !!currentUser &&
        (
            currentUser.id ===
                post.user_id ||
            isAdmin ||
            isAdminAccount(currentUser)
        );


    const created =
        formatDate(
            post.created_at
        );


    card.innerHTML = `
        <div class="post-header">

            <img
                class="post-user-photo"
                src="${escapeHtml(foto)}"
                alt="${escapeHtml(nama)}"
            >

            <div class="post-user-info">

                <strong>
                    ${escapeHtml(nama)}
                </strong>

                <small>
                    ${escapeHtml(created)}
                </small>

            </div>

            ${
                canManage
                    ? `
                    <div class="post-management">

                        <button
                            type="button"
                            class="edit-post-button"
                            title="Edit postingan"
                        >
                            <i class="fa-solid fa-pen"></i>
                            <span>Edit</span>
                        </button>

                        <button
                            type="button"
                            class="delete-post-button"
                            title="Hapus postingan"
                        >
                            <i class="fa-solid fa-trash"></i>
                            <span>Hapus</span>
                        </button>

                    </div>
                    `
                    : ""
            }

        </div>


        ${
            post.content
                ? `
                <div class="post-content">
                    ${escapeHtml(
                        post.content
                    ).replace(
                        /\n/g,
                        "<br>"
                    )}
                </div>
                `
                : ""
        }


        ${
            post.image_url
                ? `
                <div class="post-image">

                    <img
                        src="${escapeHtml(post.image_url)}"
                        alt="Foto postingan"
                        loading="lazy"
                    >

                </div>
                `
                : ""
        }


        ${
            post.file_url
                ? `
                <div class="post-file">

                    <a
                        href="${escapeHtml(post.file_url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >

                        <i class="fa-solid fa-file-lines"></i>

                        <span>
                            ${escapeHtml(
                                post.file_name ||
                                "Lihat file"
                            )}
                        </span>

                        <i class="fa-solid fa-arrow-up-right-from-square"></i>

                    </a>

                </div>
                `
                : ""
        }


        <div class="post-actions">

            <button
                type="button"
                class="post-action-button like-button"
                data-post-id="${post.id}"
                title="Suka"
            >

                <i class="fa-regular fa-thumbs-up"></i>

                <span>
                    Suka
                </span>

                <b class="like-count">
                    0
                </b>

            </button>


            <button
                type="button"
                class="post-action-button dislike-button"
                data-post-id="${post.id}"
                title="Tidak Suka"
            >

                <i class="fa-regular fa-thumbs-down"></i>

                <span>
                    Tidak Suka
                </span>

                <b class="dislike-count">
                    0
                </b>

            </button>


            <button
                type="button"
                class="post-action-button comment-toggle-button"
                title="Komentar"
            >

                <i class="fa-regular fa-comment"></i>

                <span>
                    Komentar
                </span>

                <b class="comment-count">
                    0
                </b>

            </button>


            <button
                type="button"
                class="post-action-button share-post-button"
                title="Bagikan"
            >

                <i class="fa-solid fa-share-nodes"></i>

                <span>
                    Bagikan
                </span>

            </button>

        </div>


        <div class="comments-section">

            <div class="comments-list"></div>


            <button
                type="button"
                class="show-comments-button"
                style="display:none;"
            >
                Lihat komentar lainnya
            </button>


            <div class="comment-form">

                <textarea
                    class="comment-input"
                    maxlength="5000"
                    rows="1"
                    placeholder="Tulis komentar..."
                ></textarea>


                <button
                    type="button"
                    class="comment-submit-button"
                    title="Kirim komentar"
                >

                    <i class="fa-solid fa-paper-plane"></i>

                </button>

            </div>

        </div>

    `;


    setAvatar(
        card.querySelector(
            ".post-user-photo"
        ),
        foto,
        nama
    );


    card.querySelector(
        ".edit-post-button"
    )?.addEventListener(
        "click",
        function() {

            editPost(post);

        }
    );


    card.querySelector(
        ".delete-post-button"
    )?.addEventListener(
        "click",
        function() {

            deletePost(post);

        }
    );


    card.querySelector(
        ".like-button"
    )?.addEventListener(
        "click",
        function() {

            toggleLike(
                post.id
            );

        }
    );


    card.querySelector(
        ".dislike-button"
    )?.addEventListener(
        "click",
        function() {

            toggleDislike(
                post.id
            );

        }
    );


    const commentToggle =
        card.querySelector(
            ".comment-toggle-button"
        );


    const commentsSection =
        card.querySelector(
            ".comments-section"
        );


    commentToggle?.addEventListener(
        "click",
        function() {

            commentsSection?.classList.toggle(
                "open"
            );

        }
    );


    card.querySelector(
        ".share-post-button"
    )?.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            openShareMenu(
                post,
                card
            );

        }
    );


    const commentInput =
        card.querySelector(
            ".comment-input"
        );


    const commentSubmit =
        card.querySelector(
            ".comment-submit-button"
        );


    commentSubmit?.addEventListener(
        "click",
        function() {

            addComment(
                post.id,
                commentInput
            );

        }
    );

    commentInput?.addEventListener(
        "keydown",
        function(event) {

            /*
            * ENTER = PINDAH BARIS
            * Tidak lagi mengirim komentar.
            */
            if (
                event.key === "Enter"
            ) {

                return;

            }

        }
    );

    await updatePostCounters(
        card,
        post.id
    );


    await updateCommentCount(
        card,
        post.id
    );


    await loadComments(
        card,
        post.id
    );


    return card;

}


/* =========================================================
   38. LIKE
========================================================= */

async function toggleLike(
    postId
) {

    if (!requireLogin()) {
        return;
    }


    try {

        const {
            data: existing,
            error: existingError
        } =
            await forumSupabaseClient
                .from("likes")
                .select("id")
                .eq(
                    "post_id",
                    postId
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .maybeSingle();


        if (existingError) {
            throw existingError;
        }


        if (existing) {

            const { error } =
                await forumSupabaseClient
                    .from("likes")
                    .delete()
                    .eq(
                        "id",
                        existing.id
                    );


            if (error) {
                throw error;
            }

        }
        else {

            const {
                error:
                removeDislikeError
            } =
                await forumSupabaseClient
                    .from("dislikes")
                    .delete()
                    .eq(
                        "post_id",
                        postId
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    );


            if (removeDislikeError) {
                throw removeDislikeError;
            }


            const { error } =
                await forumSupabaseClient
                    .from("likes")
                    .insert(
                        {
                            post_id:
                                postId,

                            user_id:
                                currentUser.id
                        }
                    );


            if (error) {
                throw error;
            }

        }


        await refreshPost(
            postId
        );

    }
    catch (error) {

        console.error(
            "LIKE ERROR:",
            error
        );

        alert(
            "Gagal memberikan Suka."
        );

    }

}


/* =========================================================
   39. DISLIKE
========================================================= */

async function toggleDislike(
    postId
) {

    if (!requireLogin()) {
        return;
    }


    try {

        const {
            data: existing,
            error: existingError
        } =
            await forumSupabaseClient
                .from("dislikes")
                .select("id")
                .eq(
                    "post_id",
                    postId
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .maybeSingle();


        if (existingError) {
            throw existingError;
        }


        if (existing) {

            const { error } =
                await forumSupabaseClient
                    .from("dislikes")
                    .delete()
                    .eq(
                        "id",
                        existing.id
                    );


            if (error) {
                throw error;
            }

        }
        else {

            const {
                error:
                removeLikeError
            } =
                await forumSupabaseClient
                    .from("likes")
                    .delete()
                    .eq(
                        "post_id",
                        postId
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    );


            if (removeLikeError) {
                throw removeLikeError;
            }


            const { error } =
                await forumSupabaseClient
                    .from("dislikes")
                    .insert(
                        {
                            post_id:
                                postId,

                            user_id:
                                currentUser.id
                        }
                    );


            if (error) {
                throw error;
            }

        }


        await refreshPost(
            postId
        );

    }
    catch (error) {

        console.error(
            "DISLIKE ERROR:",
            error
        );

        alert(
            "Gagal memberikan Tidak Suka."
        );

    }

}


/* =========================================================
   40. COUNTERS
========================================================= */

async function updatePostCounters(
    card,
    postId
) {

    if (!card) {
        return;
    }


    try {

        const [
            likesResult,
            dislikesResult
        ] =
            await Promise.all(
                [

                    forumSupabaseClient
                        .from("likes")
                        .select(
                            "id",
                            {
                                count:
                                    "exact",

                                head:
                                    true
                            }
                        )
                        .eq(
                            "post_id",
                            postId
                        ),


                    forumSupabaseClient
                        .from("dislikes")
                        .select(
                            "id",
                            {
                                count:
                                    "exact",

                                head:
                                    true
                            }
                        )
                        .eq(
                            "post_id",
                            postId
                        )

                ]
            );


        const likeCount =
            card.querySelector(
                ".like-count"
            );


        const dislikeCount =
            card.querySelector(
                ".dislike-count"
            );


        if (likeCount) {

            likeCount.textContent =
                likesResult.count ||
                0;

        }


        if (dislikeCount) {

            dislikeCount.textContent =
                dislikesResult.count ||
                0;

        }


        if (currentUser) {

            const [
                myLike,
                myDislike
            ] =
                await Promise.all(
                    [

                        forumSupabaseClient
                            .from("likes")
                            .select("id")
                            .eq(
                                "post_id",
                                postId
                            )
                            .eq(
                                "user_id",
                                currentUser.id
                            )
                            .maybeSingle(),


                        forumSupabaseClient
                            .from("dislikes")
                            .select("id")
                            .eq(
                                "post_id",
                                postId
                            )
                            .eq(
                                "user_id",
                                currentUser.id
                            )
                            .maybeSingle()

                    ]
                );


            card.querySelector(
                ".like-button"
            )?.classList.toggle(
                "active",
                !!myLike.data
            );


            card.querySelector(
                ".dislike-button"
            )?.classList.toggle(
                "active",
                !!myDislike.data
            );

        }

    }
    catch (error) {

        console.error(
            "COUNTER ERROR:",
            error
        );

    }

}


/* =========================================================
   41. COMMENT COUNT
========================================================= */

async function updateCommentCount(
    card,
    postId
) {

    if (!card) {
        return;
    }


    try {

        const {
            count,
            error
        } =
            await forumSupabaseClient
                .from("comments")
                .select(
                    "id",
                    {
                        count:
                            "exact",

                        head:
                            true
                    }
                )
                .eq(
                    "post_id",
                    postId
                );


        if (error) {
            throw error;
        }


        const counter =
            card.querySelector(
                ".comment-count"
            );


        if (counter) {

            counter.textContent =
                count || 0;

        }

    }
    catch (error) {

        console.warn(
            "COMMENT COUNT ERROR:",
            error
        );

    }

}


/* =========================================================
   42. REFRESH POST
========================================================= */

async function refreshPost(
    postId
) {

    const card =
        document.querySelector(
            `[data-post-id="${postId}"]`
        );


    if (!card) {
        return;
    }


    await updatePostCounters(
        card,
        postId
    );

}


/* =========================================================
   43. LOAD COMMENTS
========================================================= */

async function loadComments(
    card,
    postId
) {

    const list =
        card.querySelector(
            ".comments-list"
        );


    const moreButton =
        card.querySelector(
            ".show-comments-button"
        );


    if (!list) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await forumSupabaseClient
                .from("comments")
                .select("*")
                .eq(
                    "post_id",
                    postId
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );


        if (error) {
            throw error;
        }


        const comments =
            data || [];


        visibleComments[postId] =
            visibleComments[postId] ||
            3;


        await renderComments(
            card,
            comments
        );


        if (moreButton) {

            moreButton.style.display =
                comments.length > 3
                    ? "block"
                    : "none";


            moreButton.textContent =
                visibleComments[postId] >=
                    comments.length
                    ? "Sembunyikan komentar"
                    : "Lihat komentar lainnya";


            moreButton.onclick =
                async function() {

                    if (
                        visibleComments[postId] <
                        comments.length
                    ) {

                        visibleComments[postId] =
                            comments.length;

                    }
                    else {

                        visibleComments[postId] =
                            3;

                    }


                    await renderComments(
                        card,
                        comments
                    );


                    moreButton.textContent =
                        visibleComments[postId] >=
                            comments.length
                            ? "Sembunyikan komentar"
                            : "Lihat komentar lainnya";

                };

        }

    }
    catch (error) {

        console.error(
            "LOAD COMMENTS ERROR:",
            error
        );

    }

}


/* =========================================================
   44. RENDER COMMENTS
   REVISI FINAL ADMIN:
   - Pemilik komentar dapat Edit/Hapus
   - Admin dapat Edit/Hapus semua komentar
   - Admin dicek langsung dari email Auth
   - Tidak bergantung hanya pada variabel isAdmin
========================================================= */

async function renderComments(
    card,
    comments
) {

    const list =
        card.querySelector(
            ".comments-list"
        );


    if (!list) {
        return;
    }


    const postId =
        card.dataset.postId;


    const limit =
        visibleComments[postId] ||
        3;


    const visible =
        comments.slice(
            Math.max(
                0,
                comments.length - limit
            )
        );


    list.innerHTML =
        "";


    if (!visible.length) {
        return;
    }


    const profiles =
        await getCommentProfiles(
            visible
        );


    /*
     * =====================================================
     * ADMIN DITENTUKAN LANGSUNG DARI EMAIL AUTH
     * =====================================================
     *
     * Ini sengaja tidak hanya menggunakan isAdmin,
     * sehingga tombol tetap muncul walaupun variabel
     * isAdmin belum selesai diproses.
     */

    const authEmail =
        normalizeEmail(
            currentUser?.email || ""
        );


    const adminEmail =
        normalizeEmail(
            ADMIN_EMAIL
        );


    const currentAuthIsAdmin =
        !!currentUser &&
        authEmail === adminEmail;


    /*
     * DEBUG
     */

    console.log(
        "COMMENT ADMIN CHECK:",
        {
            user:
                currentUser?.email || "Tamu",

            authEmail:
                authEmail,

            adminEmail:
                adminEmail,

            isAdmin:
                isAdmin,

            currentAuthIsAdmin:
                currentAuthIsAdmin
        }
    );


    visible.forEach(
        comment => {

            const profile =
                profiles[
                    comment.user_id
                ] || {};


            const nama =
                profile.name ||
                (
                    profile.email
                        ? profile.email.split("@")[0]
                        : "Pengguna"
                );


            const foto =
                profile.avatar_url ||
                FALLBACK_USER_PHOTO;


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "comment-item";


            /*
             * =================================================
             * PEMILIK KOMENTAR
             * =================================================
             */

            const isOwner =
                !!currentUser &&
                String(
                    currentUser.id
                ) ===
                String(
                    comment.user_id
                );


            /*
             * =================================================
             * HAK KELOLA KOMENTAR
             * =================================================
             *
             * Pemilik:
             *     Edit + Hapus miliknya sendiri
             *
             * Admin:
             *     Edit + Hapus semua komentar
             */

            const canManageComment =
                isOwner ||
                currentAuthIsAdmin ||
                isAdmin;


            console.log(
                "COMMENT PERMISSION:",
                {
                    commentId:
                        comment.id,

                    owner:
                        isOwner,

                    admin:
                        currentAuthIsAdmin ||
                        isAdmin,

                    canManage:
                        canManageComment
                }
            );


            /*
             * =================================================
             * HTML KOMENTAR
             * =================================================
             */

            wrapper.innerHTML = `
                <img
                    class="comment-user-photo"
                    src="${escapeHtml(foto)}"
                    alt="${escapeHtml(nama)}"
                >

                <div class="comment-body">

                    <div class="comment-header">

                        <strong>
                            ${escapeHtml(nama)}
                        </strong>

                        <small>
                            ${escapeHtml(
                                formatDate(
                                    comment.created_at
                                )
                            )}
                        </small>

                    </div>


                    <div class="comment-content">

                        ${escapeHtml(
                            comment.content ||
                            ""
                        ).replace(
                            /\n/g,
                            "<br>"
                        )}

                    </div>


                    ${
                        canManageComment
                            ? `
                            <div
                                class="comment-actions"
                                style="
                                    display:flex !important;
                                    visibility:visible !important;
                                    opacity:1 !important;
                                    align-items:center !important;
                                    gap:40px !important;
                                "
                            >

                                <button
                                    type="button"
                                    class="edit-comment-button"
                                    style="
                                        display:inline-flex !important;
                                        visibility:visible !important;
                                        opacity:1 !important;
                                    "
                                    title="Edit komentar"
                                >

                                    <i class="fa-solid fa-pen"></i>

                                    <span>
                                        Edit
                                    </span>

                                </button>


                                <button
                                    type="button"
                                    class="delete-comment-button"
                                    style="
                                        display:inline-flex !important;
                                        visibility:visible !important;
                                        opacity:1 !important;
                                    "
                                    title="Hapus komentar"
                                >

                                    <i class="fa-solid fa-trash"></i>

                                    <span>
                                        Hapus
                                    </span>

                                </button>

                            </div>
                            `
                            : ""
                    }

                </div>
            `;


            setAvatar(
                wrapper.querySelector(
                    ".comment-user-photo"
                ),
                foto,
                nama
            );


            wrapper.querySelector(
                ".edit-comment-button"
            )?.addEventListener(
                "click",
                function() {

                    editComment(
                        comment
                    );

                }
            );


            wrapper.querySelector(
                ".delete-comment-button"
            )?.addEventListener(
                "click",
                function() {

                    deleteComment(
                        comment
                    );

                }
            );


            list.appendChild(
                wrapper
            );

        }
    );

}


/* =========================================================
   45. COMMENT PROFILES
========================================================= */

async function getCommentProfiles(
    comments
) {

    const ids =
        [
            ...new Set(
                comments
                    .map(
                        comment =>
                            comment.user_id
                    )
                    .filter(Boolean)
            )
        ];


    if (!ids.length) {
        return {};
    }


    const {
        data,
        error
    } =
        await forumSupabaseClient
            .from("users")
            .select(
                "id,name,email,avatar_url"
            )
            .in(
                "id",
                ids
            );


    if (error) {

        console.warn(
            "COMMENT PROFILE ERROR:",
            error
        );

        return {};

    }


    const profiles =
        {};


    (data || []).forEach(
        profile => {

            profiles[
                profile.id
            ] = profile;

        }
    );


    return profiles;

}


/* =========================================================
   46. ADD COMMENT
========================================================= */

async function addComment(
    postId,
    input
) {

    if (!requireLogin()) {
        return;
    }


    const content =
        input?.value.trim() ||
        "";


    if (!content) {
        return;
    }


    try {

        const { error } =
            await forumSupabaseClient
                .from("comments")
                .insert(
                    {
                        post_id:
                            postId,

                        user_id:
                            currentUser.id,

                        content:
                            content
                    }
                );


        if (error) {
            throw error;
        }


        input.value =
            "";


        const card =
            document.querySelector(
                `[data-post-id="${postId}"]`
            );


        if (card) {

            await loadComments(
                card,
                postId
            );


            await updateCommentCount(
                card,
                postId
            );

        }

    }
    catch (error) {

        console.error(
            "COMMENT ERROR:",
            error
        );

        alert(
            "Komentar gagal ditambahkan."
        );

    }

}


/* =========================================================
   47. EDIT COMMENT
   REVISI FINAL ADMIN
========================================================= */

async function editComment(
    comment
) {

    /*
     * =====================================================
     * ADMIN DICEK LANGSUNG DARI AUTH EMAIL
     * =====================================================
     */

    const currentAuthIsAdmin =
        !!currentUser &&
        normalizeEmail(
            currentUser.email
        ) ===
        normalizeEmail(
            ADMIN_EMAIL
        );


    /*
     * =====================================================
     * CEK PEMILIK ATAU ADMIN
     * =====================================================
     */

    const isOwner =
        !!currentUser &&
        String(
            currentUser.id
        ) ===
        String(
            comment.user_id
        );


    const canManage =
        isOwner ||
        currentAuthIsAdmin ||
        isAdmin;


    if (
        !currentUser ||
        !canManage
    ) {

        alert(
            "Anda tidak dapat mengedit komentar ini."
        );

        return;

    }


    const newContent =
        prompt(
            "Edit komentar:",
            comment.content ||
            ""
        );


    if (newContent === null) {
        return;
    }


    const content =
        newContent.trim();


    if (!content) {

        alert(
            "Komentar tidak boleh kosong."
        );

        return;

    }


    try {

        /*
         * ADMIN:
         * update berdasarkan ID komentar.
         *
         * USER BIASA:
         * update hanya komentar miliknya.
         */

        const effectiveAdmin =
            currentAuthIsAdmin ||
            isAdmin;


        let query =
            forumSupabaseClient
                .from("comments")
                .update(
                    {
                        content:
                            content
                    }
                )
                .eq(
                    "id",
                    comment.id
                );


        if (!effectiveAdmin) {

            query =
                query.eq(
                    "user_id",
                    currentUser.id
                );

        }


        const {
            data,
            error
        } =
            await query
                .select();


        if (error) {
            throw error;
        }


        console.log(
            "EDIT COMMENT BERHASIL:",
            data
        );


        const card =
            document.querySelector(
                `[data-post-id="${comment.post_id}"]`
            );


        if (card) {

            await loadComments(
                card,
                comment.post_id
            );

        }

    }
    catch (error) {

        console.error(
            "EDIT COMMENT ERROR:",
            error
        );

        alert(
            "Komentar gagal diedit."
        );

    }

}


/* =========================================================
   48. DELETE COMMENT
   REVISI FINAL ADMIN
========================================================= */

async function deleteComment(
    comment
) {

    /*
     * =====================================================
     * ADMIN DICEK LANGSUNG DARI AUTH EMAIL
     * =====================================================
     */

    const currentAuthIsAdmin =
        !!currentUser &&
        normalizeEmail(
            currentUser.email
        ) ===
        normalizeEmail(
            ADMIN_EMAIL
        );


    /*
     * =====================================================
     * CEK PEMILIK ATAU ADMIN
     * =====================================================
     */

    const isOwner =
        !!currentUser &&
        String(
            currentUser.id
        ) ===
        String(
            comment.user_id
        );


    const canManage =
        isOwner ||
        currentAuthIsAdmin ||
        isAdmin;


    if (
        !currentUser ||
        !canManage
    ) {

        alert(
            "Anda tidak dapat menghapus komentar ini."
        );

        return;

    }


    if (
        !confirm(
            "Hapus komentar ini?"
        )
    ) {

        return;

    }


    try {

        /*
         * ADMIN:
         * hapus berdasarkan ID komentar.
         *
         * USER BIASA:
         * hapus hanya komentar miliknya.
         */

        const effectiveAdmin =
            currentAuthIsAdmin ||
            isAdmin;


        let query =
            forumSupabaseClient
                .from("comments")
                .delete()
                .eq(
                    "id",
                    comment.id
                );


        if (!effectiveAdmin) {

            query =
                query.eq(
                    "user_id",
                    currentUser.id
                );

        }


        const {
            data,
            error
        } =
            await query
                .select();


        if (error) {
            throw error;
        }


        console.log(
            "DELETE COMMENT BERHASIL:",
            data
        );


        const card =
            document.querySelector(
                `[data-post-id="${comment.post_id}"]`
            );


        if (card) {

            await loadComments(
                card,
                comment.post_id
            );


            await updateCommentCount(
                card,
                comment.post_id
            );

        }

    }
    catch (error) {

        console.error(
            "DELETE COMMENT ERROR:",
            error
        );

        alert(
            "Komentar gagal dihapus."
        );

    }

}


/* =========================================================
   49. EDIT POST
========================================================= */

async function editPost(
    post
) {

    if (!currentUser) {

        showLoginModal();

        return;

    }


    if (
        currentUser.id !==
            post.user_id &&
        !isAdmin &&
        !isAdminAccount(currentUser)
    ) {

        alert(
            "Anda tidak dapat mengedit postingan ini."
        );

        return;

    }


    const newContent =
        prompt(
            "Edit postingan:",
            post.content ||
            ""
        );


    if (newContent === null) {
        return;
    }


    try {

        const { error } =
            await forumSupabaseClient
                .from("posts")
                .update(
                    {
                        content:
                            newContent.trim()
                    }
                )
                .eq(
                    "id",
                    post.id
                );


        if (error) {
            throw error;
        }


        await loadPosts();

    }
    catch (error) {

        console.error(
            "EDIT POST ERROR:",
            error
        );

        alert(
            "Postingan gagal diedit:\n\n" +
            (
                error?.message ||
                "Terjadi kesalahan."
            )
        );

    }

}


/* =========================================================
   50. EXTRACT STORAGE PATH
========================================================= */

function extractStoragePaths(
    post
) {

    const paths =
        [];


    if (post?.image_path) {
        paths.push(
            post.image_path
        );
    }

    if (post?.file_path) {
        paths.push(
            post.file_path
        );
    }


    [
        post?.image_url,
        post?.file_url
    ].forEach(
        url => {

            if (!url) {
                return;
            }


            try {

                const marker =
                    `/storage/v1/object/public/${STORAGE_BUCKET}/`;


                const index =
                    url.indexOf(
                        marker
                    );


                if (index !== -1) {

                    const path =
                        decodeURIComponent(
                            url.substring(
                                index +
                                marker.length
                            )
                        );


                    if (path) {

                        paths.push(
                            path
                        );

                    }

                }

            }
            catch (error) {

                console.warn(
                    "EXTRACT STORAGE PATH ERROR:",
                    error
                );

            }

        }
    );


    return [
        ...new Set(
            paths
                .filter(
                    path =>
                        typeof path === "string"
                )
                .map(
                    path =>
                        path.trim()
                )
                .filter(Boolean)
        )
    ];

}


/* =========================================================
   51. DELETE POST
========================================================= */

async function deletePost(
    post
) {

    if (!currentUser) {

        showLoginModal();

        return;

    }


    if (
        currentUser.id !==
            post.user_id &&
        !isAdmin &&
        !isAdminAccount(currentUser)
    ) {

        alert(
            "Anda tidak dapat menghapus postingan ini."
        );

        return;

    }


    if (
        !confirm(
            "Hapus postingan ini?\n\nFoto/file yang terkait juga akan dihapus dari Storage."
        )
    ) {

        return;

    }


    try {

        const paths =
            extractStoragePaths(
                post
            );


        console.log(
            "PATH STORAGE POST:",
            paths
        );


        if (paths.length) {

            const storageResult =
                await cleanupUploadedFiles(
                    paths
                );


            if (
                !storageResult.success
            ) {

                throw new Error(
                    "File Storage tidak dapat dihapus.\n\n" +
                    "Postingan TIDAK dihapus agar data tetap aman.\n\n" +
                    "Periksa Storage DELETE Policy Supabase."
                );

            }

        }


        const { error } =
            await forumSupabaseClient
                .from("posts")
                .delete()
                .eq(
                    "id",
                    post.id
                );


        if (error) {
            throw error;
        }


        console.log(
            "POST BERHASIL DIHAPUS:",
            post.id
        );


        await loadPosts();

    }
    catch (error) {

        console.error(
            "DELETE POST ERROR:",
            error
        );

        alert(
            "Postingan gagal dihapus:\n\n" +
            (
                error?.message ||
                "Terjadi kesalahan."
            )
        );

    }

}


/* =========================================================
   52. SHARE URL
========================================================= */

function getPostShareUrl(
    post
) {

    const baseUrl =
        window.location.origin +
        window.location.pathname;


    return (
        `${baseUrl}#post-${encodeURIComponent(post.id)}`
    );

}


/* =========================================================
   53. SHARE TITLE
========================================================= */

function getPostShareTitle(
    post
) {

    const text =
        String(
            post.content ||
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();


    if (!text) {

        return (
            "Postingan Forum GURU PUCANGLABAN"
        );

    }


    return (
        text.length > 80
            ? text.substring(
                0,
                80
              ) + "..."
            : text
    );

}


/* =========================================================
   54. SHARE MENU
========================================================= */

function openShareMenu(
    post,
    card
) {

    closeAllShareMenus();


    const url =
        getPostShareUrl(
            post
        );


    const title =
        getPostShareTitle(
            post
        );


    const text =
        `${title}\n\n${url}`;


    const menu =
        document.createElement(
            "div"
        );


    menu.className =
        "forum-share-menu";


    menu.innerHTML = `
        <div class="share-menu-header">

            <strong>

                <i class="fa-solid fa-share-nodes"></i>

                Bagikan postingan

            </strong>


            <button
                type="button"
                class="share-close-button"
                title="Tutup"
            >

                <i class="fa-solid fa-xmark"></i>

            </button>

        </div>


        <div class="share-grid">

            <button
                type="button"
                data-share="whatsapp"
            >

                <i class="fa-brands fa-whatsapp"></i>

                <span>
                    WhatsApp
                </span>

            </button>


            <button
                type="button"
                data-share="facebook"
            >

                <i class="fa-brands fa-facebook"></i>

                <span>
                    Facebook
                </span>

            </button>


            <button
                type="button"
                data-share="telegram"
            >

                <i class="fa-brands fa-telegram"></i>

                <span>
                    Telegram
                </span>

            </button>


            <button
                type="button"
                data-share="x"
            >

                <i class="fa-brands fa-x-twitter"></i>

                <span>
                    X
                </span>

            </button>


            <button
                type="button"
                data-share="linkedin"
            >

                <i class="fa-brands fa-linkedin"></i>

                <span>
                    LinkedIn
                </span>

            </button>


            <button
                type="button"
                data-share="reddit"
            >

                <i class="fa-brands fa-reddit"></i>

                <span>
                    Reddit
                </span>

            </button>


            <button
                type="button"
                data-share="email"
            >

                <i class="fa-solid fa-envelope"></i>

                <span>
                    Email
                </span>

            </button>


            <button
                type="button"
                data-share="copy"
            >

                <i class="fa-solid fa-link"></i>

                <span>
                    Salin Link
                </span>

            </button>


            <button
                type="button"
                data-share="native"
            >

                <i class="fa-solid fa-arrow-up-from-bracket"></i>

                <span>
                    Bagikan lainnya
                </span>

            </button>

        </div>
    `;


    card.appendChild(
        menu
    );


    menu.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

        }
    );


    menu.querySelector(
        ".share-close-button"
    )?.addEventListener(
        "click",
        function() {

            menu.remove();

        }
    );


    menu.querySelectorAll(
        "[data-share]"
    ).forEach(
        button => {

            button.addEventListener(
                "click",
                function() {

                    handleShare(
                        this.dataset.share,
                        url,
                        title,
                        text
                    );

                }
            );

        }
    );

}


/* =========================================================
   55. HANDLE SHARE
========================================================= */

async function handleShare(
    platform,
    url,
    title,
    text
) {

    let shareUrl =
        null;


    switch (platform) {

        case "whatsapp":

            shareUrl =
                "https://api.whatsapp.com/send?text=" +
                encodeURIComponent(
                    text
                );

            break;


        case "facebook":

            shareUrl =
                "https://www.facebook.com/sharer/sharer.php?u=" +
                encodeURIComponent(
                    url
                );

            break;


        case "telegram":

            shareUrl =
                "https://t.me/share/url?url=" +
                encodeURIComponent(
                    url
                ) +
                "&text=" +
                encodeURIComponent(
                    title
                );

            break;


        case "x":

            shareUrl =
                "https://twitter.com/intent/tweet?url=" +
                encodeURIComponent(
                    url
                ) +
                "&text=" +
                encodeURIComponent(
                    title
                );

            break;


        case "linkedin":

            shareUrl =
                "https://www.linkedin.com/sharing/share-offsite/?url=" +
                encodeURIComponent(
                    url
                );

            break;


        case "reddit":

            shareUrl =
                "https://www.reddit.com/submit?url=" +
                encodeURIComponent(
                    url
                ) +
                "&title=" +
                encodeURIComponent(
                    title
                );

            break;


        case "email":

            shareUrl =
                "mailto:?subject=" +
                encodeURIComponent(
                    title
                ) +
                "&body=" +
                encodeURIComponent(
                    text
                );

            break;


        case "copy":

            try {

                if (
                    navigator.clipboard &&
                    window.isSecureContext
                ) {

                    await navigator.clipboard.writeText(
                        url
                    );

                }
                else {

                    fallbackCopyText(
                        url
                    );

                    closeAllShareMenus();

                    return;

                }


                showShareMessage(
                    "Link postingan berhasil disalin."
                );

            }
            catch (error) {

                console.warn(
                    "CLIPBOARD ERROR:",
                    error
                );

                fallbackCopyText(
                    url
                );

            }


            closeAllShareMenus();

            return;


        case "native":

            if (
                navigator.share
            ) {

                try {

                    await navigator.share(
                        {
                            title:
                                title,

                            text:
                                title,

                            url:
                                url
                        }
                    );

                }
                catch (error) {

                    if (
                        error?.name !==
                        "AbortError"
                    ) {

                        console.warn(
                            "NATIVE SHARE ERROR:",
                            error
                        );

                    }

                }

            }
            else {

                showShareMessage(
                    "Share bawaan perangkat tidak tersedia di browser ini."
                );

            }


            closeAllShareMenus();

            return;

    }


    if (shareUrl) {

        window.open(
            shareUrl,
            "_blank",
            "noopener,noreferrer,width=700,height=650"
        );

    }


    closeAllShareMenus();

}


/* =========================================================
   56. FALLBACK COPY
========================================================= */

function fallbackCopyText(
    text
) {

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.value =
        text;


    textarea.style.position =
        "fixed";


    textarea.style.left =
        "-9999px";


    textarea.style.top =
        "0";


    document.body.appendChild(
        textarea
    );


    textarea.focus();

    textarea.select();


    try {

        document.execCommand(
            "copy"
        );


        showShareMessage(
            "Link postingan berhasil disalin."
        );

    }
    catch (error) {

        alert(
            "Link postingan:\n\n" +
            text
        );

    }


    textarea.remove();

}


/* =========================================================
   57. SHARE MESSAGE
========================================================= */

function showShareMessage(
    message
) {

    const old =
        document.querySelector(
            ".forum-share-message"
        );


    old?.remove();


    const box =
        document.createElement(
            "div"
        );


    box.className =
        "forum-share-message";


    box.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>

        <span>
            ${escapeHtml(message)}
        </span>
    `;


    document.body.appendChild(
        box
    );


    setTimeout(
        function() {

            box.classList.add(
                "hide"
            );


            setTimeout(
                function() {

                    box.remove();

                },
                300
            );

        },
        2500
    );

}


/* =========================================================
   58. CLOSE SHARE MENUS
========================================================= */

function closeAllShareMenus() {

    document
        .querySelectorAll(
            ".forum-share-menu"
        )
        .forEach(
            menu =>
                menu.remove()
        );

}


document.addEventListener(
    "click",
    function() {

        closeAllShareMenus();

    }
);


/* =========================================================
   59. CSS TAMBAHAN
========================================================= */

function injectForumStyles() {

    if (
        document.getElementById(
            "forum-js-modern-style"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "forum-js-modern-style";


    style.textContent = `

        .post-card {
            position: relative;
        }

        .post-user-photo {
            width: 72px !important;
            height: 72px !important;
            min-width: 72px !important;
            min-height: 72px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            flex-shrink: 0;
        }

        .comment-user-photo {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            min-height: 28px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            flex-shrink: 0;
        }

        /* =================================================
        TAMPILKAN SELURUH ISI POSTINGAN
        ================================================= */

        .post-content {
            white-space: normal !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            display: block !important;
            line-height: 1.5;
            word-wrap: break-word;
            overflow-wrap: anywhere;
        }


        /* =================================================
        TAMPILKAN SELURUH ISI KOMENTAR
        ================================================= */

        .comment-content {
            white-space: normal !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            display: block !important;
            line-height: 1.45;
            word-wrap: break-word;
            overflow-wrap: anywhere;
        }

        /* =================================================
           TOMBOL EDIT & HAPUS POSTINGAN
           JARAK = 40px
        ================================================= */

        .post-management {
            display: flex;
            align-items: center;
            gap: 40px;
            margin-left: auto;
        }

        .post-management button {
            border: 0;
            border-radius: 9px;
            padding: 7px 11px;
            font-size: 12px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            cursor: pointer;
            transition:
                transform .18s ease,
                box-shadow .18s ease;
        }

        .post-management button:hover {
            transform: translateY(-1px);
            box-shadow:
                0 4px 12px rgba(0,0,0,.10);
        }

        .edit-post-button {
            background: #e8f5e9 !important;
            color: #2e7d32 !important;
        }

        .delete-post-button {
            background: #ffebee !important;
            color: #c62828 !important;
        }

        /* =================================================
           TOMBOL KIRIM DI SAMPING
        ================================================= */

        .comment-form {
            display: flex;
            align-items: flex-end;
            gap: 8px;
            width: 100%;
        }

        .comment-input {
            flex: 1;
            min-width: 0;
            width: 100%;

            height: 60px !important;
            min-height: 60px !important;
            max-height: 60px !important;

            padding: 9px 12px;
            resize: none;

            overflow-y: auto;

            box-sizing: border-box;

            line-height: 20px;
            font-family: inherit;
            font-size: 12px;

            border-radius: 10px;

            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: pre-wrap;
        }

        .comment-submit-button {
            flex: 0 0 42px;
            width: 42px;
            height: 42px;
            padding: 0;
            border: 0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        @media (max-width: 600px) {

            .comment-form {
                gap: 6px;
            }

            .comment-submit-button {
                flex-basis: 38px;
                width: 38px;
                height: 38px;
            }

        }

        /* =================================================
          TAMPILAN KOMENTAR LEBIH KECIL
        ================================================= */

        .comment-header strong {
            font-size: 12px !important;
            font-weight: 600 !important;
        }

        .comment-header small {
            font-size: 10px !important;
            color: #8a949c;
        }

        .comment-content {
            font-size: 12px !important;
            line-height: 1.45;
        }

        .comment-actions button {
            font-size: 10px !important;
        }

        .comment-actions button i {
            font-size: 10px !important;
        }

        /* =================================================
           TOMBOL EDIT & HAPUS KOMENTAR
           JARAK = 40px
        ================================================= */

        .comment-actions {
            display: flex;
            align-items: center;
            gap: 40px;
        }

        .comment-actions button {
            border: 0;
            background: transparent;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .post-actions {
            display: flex !important;
            align-items: stretch;
            width: 100%;
            gap: 7px;
            padding: 10px 0 5px;
            flex-wrap: nowrap;
        }

        .post-action-button {
            flex: 1 1 0;
            min-width: 0;
            border: 0 !important;
            border-radius: 11px !important;
            padding: 9px 8px !important;
            background: #f5f7f8 !important;
            color: #56616a !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            gap: 6px;
            cursor: pointer;
            transition:
                transform .18s ease,
                background .18s ease,
                color .18s ease,
                box-shadow .18s ease;
            white-space: nowrap;
        }

        .post-action-button:hover {
            transform: translateY(-1px);
            box-shadow:
                0 4px 12px rgba(0,0,0,.08);
        }

        .post-action-button i {
            font-size: 15px;
        }

        .post-action-button b {
            font-size: 11px;
            font-weight: 700;
            min-width: 17px;
            padding: 2px 5px;
            border-radius: 20px;
            background: rgba(0,0,0,.06);
        }

        .like-button:hover,
        .like-button.active {
            background: #e8f5e9 !important;
            color: #2e7d32 !important;
        }

        .dislike-button:hover,
        .dislike-button.active {
            background: #ffebee !important;
            color: #c62828 !important;
        }

        .comment-toggle-button:hover {
            background: #e3f2fd !important;
            color: #1565c0 !important;
        }

        .share-post-button:hover {
            background: #f3e5f5 !important;
            color: #7b1fa2 !important;
        }

        .forum-share-menu {
            position: absolute;
            z-index: 9999;
            right: 12px;
            bottom: 58px;
            width: min(390px, calc(100% - 24px));
            background: #ffffff;
            border: 1px solid #e5e8eb;
            border-radius: 17px;
            padding: 14px;
            box-shadow:
                0 15px 40px rgba(0,0,0,.16);
            animation:
                forumShareIn .18s ease;
        }

        @keyframes forumShareIn {
            from {
                opacity: 0;
                transform:
                    translateY(8px)
                    scale(.98);
            }

            to {
                opacity: 1;
                transform:
                    translateY(0)
                    scale(1);
            }
        }

        .share-menu-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 12px;
            color: #27313a;
        }

        .share-menu-header strong {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }

        .share-menu-header strong i {
            color: #7b1fa2;
        }

        .share-close-button {
            width: 31px;
            height: 31px;
            border: 0;
            border-radius: 50%;
            background: #f1f3f4;
            color: #667078;
            cursor: pointer;
        }

        .share-grid {
            display: grid;
            grid-template-columns:
                repeat(3, 1fr);
            gap: 8px;
        }

        .share-grid button {
            border: 0;
            border-radius: 12px;
            background: #f7f8f9;
            padding: 11px 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            color: #46515a;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            transition:
                transform .16s ease,
                background .16s ease;
        }

        .share-grid button:hover {
            transform:
                translateY(-2px);
            background:
                #edf0f2;
        }

        .share-grid button i {
            font-size: 21px;
        }

        .share-grid button[data-share="whatsapp"] i {
            color: #25d366;
        }

        .share-grid button[data-share="facebook"] i {
            color: #1877f2;
        }

        .share-grid button[data-share="telegram"] i {
            color: #229ed9;
        }

        .share-grid button[data-share="x"] i {
            color: #111;
        }

        .share-grid button[data-share="linkedin"] i {
            color: #0a66c2;
        }

        .share-grid button[data-share="reddit"] i {
            color: #ff4500;
        }

        .share-grid button[data-share="email"] i {
            color: #607d8b;
        }

        .share-grid button[data-share="copy"] i {
            color: #00897b;
        }

        .share-grid button[data-share="native"] i {
            color: #7b1fa2;
        }

        .forum-share-message {
            position: fixed;
            left: 50%;
            bottom: 28px;
            transform:
                translateX(-50%);
            z-index: 10000;
            background: #263238;
            color: white;
            padding: 11px 17px;
            border-radius: 30px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            box-shadow:
                0 8px 25px rgba(0,0,0,.22);
        }

        .forum-share-message i {
            color: #66bb6a;
        }

        .forum-share-message.hide {
            opacity: 0;
            transform:
                translateX(-50%)
                translateY(8px);
            transition:
                opacity .3s ease,
                transform .3s ease;
        }

        @media (max-width: 600px) {

            .post-actions {
                gap: 4px;
            }

            .post-action-button {
                padding: 9px 4px !important;
                font-size: 11px !important;
                gap: 4px;
            }

            .post-action-button i {
                font-size: 14px;
            }

            .post-action-button b {
                font-size: 10px;
                min-width: 15px;
                padding: 2px 4px;
            }

            .post-management button {
                padding: 6px 8px;
            }

            .post-management button span {
                display: none;
            }

            .forum-share-menu {
                right: 8px;
                width:
                    calc(100% - 16px);
            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   60. INIT
========================================================= */

async function initForum() {

    console.log(
        "========================================"
    );

    console.log(
        "GURU PUCANGLABAN FORUM.JS FINAL v6"
    );

    console.log(
        "SUPABASE AUTH MODE: SESSION + USER"
    );

    console.log(
        "ADMIN:",
        ADMIN_EMAIL
    );

    console.log(
        "========================================"
    );


    injectForumStyles();


    authReady =
        false;


    showLoadingUser();

    updatePostAccess();


    await checkSession();


    await loadPosts();


    console.log(
        "========================================"
    );

    console.log(
        "FORUM SIAP"
    );

    console.log(
        "USER:",
        currentUser?.email ||
        "BELUM LOGIN"
    );

    console.log(
        "NAMA:",
        currentUser
            ? getUserName(currentUser)
            : "Tamu"
    );

    console.log(
        "ADMIN:",
        isAdmin
    );

    console.log(
        "SESSION:",
        !!currentSession
    );

    console.log(
        "========================================"
    );

}


/* =========================================================
   61. GLOBAL DEBUG
========================================================= */

window.forumAuth = {

    getUser:
        function() {

            return currentUser;

        },


    getSession:
        function() {

            return currentSession;

        },


    getProfile:
        function() {

            return currentUserProfile;

        },


    isAdmin:
        function() {

            return (
                isAdmin ||
                isAdminAccount(
                    currentUser
                )
            );

        },


    refresh:
        async function() {

            await checkSession();

            await loadPosts();

        }

};


/* =========================================================
   62. START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initForum
    );

}
else {

    initForum();

}


/* =========================================================
   SELESAI
========================================================= */