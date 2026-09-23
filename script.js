// 1. تهيئة Supabase
const SUPABASE_URL = 'https://uonnamkufwcfwsqyarln.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kgXY8NBKb2srLNOPLXJoCw_RE9zRHfB';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. العناصر من الـ DOM
const navPublishBtn = document.getElementById('nav-publish-btn');
const navProfileBtn = document.getElementById('nav-profile-btn');

const authModal = document.getElementById('auth-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const facebookLoginBtn = document.getElementById('facebook-login-btn');

const profileModal = document.getElementById('profile-modal');
const closeProfileBtn = document.getElementById('close-profile-btn');
const userDisplayName = document.getElementById('user-display-name');
const logoutBtn = document.getElementById('logout-btn');

const publishModal = document.getElementById('publish-modal');
const closePublishBtn = document.getElementById('close-publish-btn');
const submitPostBtn = document.getElementById('submit-post-btn');
const postContent = document.getElementById('post-content');

const feedContainer = document.querySelector('.feed-container .container');

let currentUser = null;

// 3. فحص حالة الجلسة
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session ? session.user : null;
    
    if (currentUser) {
        const name = currentUser.user_metadata.full_name || currentUser.email;
        navProfileBtn.textContent = name;
        userDisplayName.textContent = name;
    } else {
        navProfileBtn.textContent = 'البروفايل';
    }
}

// 4. إغلاق جميع النوافذ المنبثقة
function closeModals() {
    authModal.style.display = 'none';
    profileModal.style.display = 'none';
    if (publishModal) publishModal.style.display = 'none';
}

// 5. أحداث النقر

// زر النشر في الشريط العلوي
navPublishBtn.addEventListener('click', () => {
    if (!currentUser) {
        authModal.style.display = 'flex';
    } else {
        publishModal.style.display = 'flex';
    }
});

// زر البروفايل
navProfileBtn.addEventListener('click', () => {
    if (!currentUser) {
        authModal.style.display = 'flex';
    } else {
        profileModal.style.display = 'flex';
    }
});

// تسجيل الدخول بواسطة Google
googleLoginBtn.addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
    if (error) console.error('خطأ في Google:', error.message);
});

// تسجيل الدخول بواسطة Facebook
if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener('click', async () => {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'facebook',
            options: { redirectTo: window.location.origin }
        });
        if (error) console.error('خطأ في Facebook:', error.message);
    });
}

// تسجيل الخروج
logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    currentUser = null;
    closeModals();
    location.reload();
});

// تأكيد النشر وإضافة الكارت للواجهة
if (submitPostBtn) {
    submitPostBtn.addEventListener('click', () => {
        const text = postContent.value.trim();
        if (!text) {
            alert('الرجاء كتابة شيء قبل النشر');
            return;
        }

        const newPost = document.createElement('div');
        newPost.className = 'feed-card';

        const authorName = currentUser?.user_metadata?.full_name || currentUser?.email || 'مستخدم';
        
        newPost.innerHTML = `
            <p style="font-weight: bold; margin-bottom: 5px;">${authorName}</p>
            <p>${text}</p>
        `;

        feedContainer.appendChild(newPost);
        postContent.value = '';
        closeModals();
    });
}

// أزرار إغلاق النوافذ (X)
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModals);
if (closeProfileBtn) closeProfileBtn.addEventListener('click', closeModals);
if (closePublishBtn) closePublishBtn.addEventListener('click', closeModals);

// بدء الفحص
checkAuth();