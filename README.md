# Cloud Storage App (Supabase Storage)

تطبيق بسيط لرفع الملفات إلى Supabase Storage باستخدام React + Vite.

## المتطلبات

- Node.js 18+
- حساب على [Supabase](https://supabase.com)

## خطوات التشغيل محلياً

1. قم بتحميل هذا المشروع وفك الضغط عنه.
2. داخل مجلد المشروع، ثبّت الحزم:

   ```bash
   npm install
   ```

3. أنشئ ملف `.env.local` في جذر المشروع بناءً على ملف `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

4. حدّث القيم في `.env.local`:

   ```env
   VITE_SUPABASE_URL="https://YOUR-PROJECT-ID.supabase.co"
   VITE_SUPABASE_ANON_KEY="YOUR_PUBLIC_ANON_KEY_HERE"
   VITE_SUPABASE_BUCKET="files"
   ```

5. شغّل التطبيق في وضع التطوير:

   ```bash
   npm run dev
   ```

6. افتح المتصفح على العنوان الذي يظهر لك (عادةً http://localhost:5173).

## ملاحظة

- تأكد من إنشاء Bucket باسم `files` في Supabase وجعله Public أو ضبط سياسات RLS المناسبة.
