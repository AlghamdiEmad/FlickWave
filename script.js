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

// 3. فحص حالة الجلسة وقراءة المنشورات
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

    // تحميل المنشورات من قاعدة البيانات عند فتح الصفحة
    loadPosts();
}

// جلب المنشورات من جدول posts وعرضها
async function loadPosts() {
    if (!feedContainer) return;
    feedContainer.innerHTML = '';
    
    const { data: posts, error } = await supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('خطأ في جلب المنشورات:', error.message);
        return;
    }

    posts.forEach(post => {
        const newPost = document.createElement('div');
        newPost.className = 'feed-card';
        newPost.innerHTML = `
            <p style="font-weight: bold; margin-bottom: 5px;">${post.username || 'مستخدم'}</p>
            <p>${post.content}</p>
        `;
        feedContainer.appendChild(newPost);
    });
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
        options: { redirectTo: window.location.href }
    });
    if (error) console.error('خطأ في Google:', error.message);
});

// تسجيل الدخول بواسطة Facebook
if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener('click', async () => {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'facebook',
            options: { redirectTo: window.location.href }
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

// تأكيد النشر والحفظ في قاعدة البيانات
if (submitPostBtn) {
    submitPostBtn.addEventListener('click', async () => {
        const text = postContent.value.trim();
        if (!text) {
            alert('الرجاء كتابة شيء قبل النشر');
            return;
        }

        const authorName = currentUser?.user_metadata?.full_name || currentUser?.email || 'مستخدم';
        
        // إدخال المنشور في Supabase
        const { error } = await supabaseClient
            .from('posts')
            .insert([
                { username: authorName, content: text }
            ]);

        if (error) {
            alert('حدث خطأ أثناء النشر: ' + error.message);
            console.error(error);
            return;
        }

        postContent.value = '';
        closeModals();
        loadPosts();
    });
}

// أزرار إغلاق النوافذ (X)
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModals);
if (closeProfileBtn) closeProfileBtn.addEventListener('click', closeModals);
if (closePublishBtn) closePublishBtn.addEventListener('click', closeModals);

// بدء الفحص
checkAuth();
