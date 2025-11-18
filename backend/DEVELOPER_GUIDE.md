# دليل المطور - صالون الجمال

## 📋 نظرة عامة على المشروع

هذا مشروع صالون جمال متكامل يتضمن:
- **Backend**: Django REST API
- **Frontend**: React.js مع Vite
- **Database**: SQLite (قابل للتطوير إلى PostgreSQL)
- **Admin Panel**: Django Admin مخصص

## 🏗️ هيكل المشروع

```
salon-website/
├── backend/                    # Django Backend
│   ├── salon/                 # التطبيق الرئيسي
│   │   ├── admin.py           # إعدادات Admin (مبسط - 322 سطر)
│   │   ├── admin_configs/     # تقسيم Admin Classes
│   │   │   ├── core_services.py    # الخدمات الأساسية
│   │   │   ├── bookings.py        # الحجوزات والمواعيد
│   │   │   ├── content.py         # المحتوى (Blog, Newsletter)
│   │   │   └── notifications.py   # الإشعارات
│   │   ├── models.py         # نماذج البيانات
│   │   ├── views/            # Views منظمة
│   │   └── urls.py           # URLs
│   ├── salon_backend/        # إعدادات Django
│   └── manage.py
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # مكونات React
│   │   ├── pages/           # صفحات التطبيق
│   │   ├── services/        # API Services
│   │   └── utils/           # أدوات مساعدة
│   └── package.json
└── README.md
```

## 🚀 البدء السريع

### 1. إعداد Backend

```bash
cd backend
python -m venv django_env
django_env\Scripts\activate  # Windows
# source django_env/bin/activate  # Linux/Mac

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 2. إعداد Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📊 النماذج الرئيسية

### 1. نماذج الخدمات الأساسية
- **Category**: فئات الخدمات
- **Service**: الخدمات المتاحة
- **Staff**: الموظفين
- **Customer**: العملاء
- **Address**: عناوين العملاء

### 2. نماذج الحجوزات
- **Booking**: الحجوزات الرئيسية
- **AppointmentRequest**: طلبات المواعيد
- **WorkingHours**: أوقات عمل الموظفين
- **DayOff**: أيام الإجازة

### 3. نماذج المحتوى
- **BlogPost**: مقالات المدونة
- **BlogCategory**: فئات المقالات
- **NewsletterSubscriber**: مشتركي النشرة الإخبارية
- **Testimonial**: شهادات العملاء

## 🎛️ Admin Panel المخصص

### تقسيم Admin Classes

تم تقسيم ملف `admin.py` الكبير (1790 سطر) إلى ملفات منظمة:

#### 1. `admin_configs/core_services.py`
```python
# الخدمات الأساسية
CategoryAdmin, ServiceAdmin, StaffAdmin, CustomerAdmin
AddressAdmin, CouponAdmin, HeroImageAdmin
ServiceCategoryAdmin, ServiceItemAdmin, TestimonialAdmin
OfferAdmin, ContactInfoAdmin, ContactAdmin
```

#### 2. `admin_configs/bookings.py`
```python
# الحجوزات والمواعيد
BookingAdmin, ConfigAdmin, WorkingHoursAdmin, DayOffAdmin
AppointmentRequestAdmin, AppointmentRescheduleHistoryAdmin
PasswordResetTokenAdmin, AdminSlotAvailabilityAdmin
```

#### 3. `admin_configs/content.py`
```python
# المحتوى والمدونة
BlogAuthorAdmin, BlogCategoryAdmin, BlogPostAdmin
BlogCommentAdmin, NewsletterSubscriberAdmin
```

#### 4. `admin_configs/notifications.py`
```python
# الإشعارات
NotificationAdmin, NotificationSettingsAdmin
```

### ميزات Admin المخصصة

#### 1. لوحة تحكم تفاعلية
- إحصائيات شاملة
- رسوم بيانية للإيرادات
- تنبيهات تشغيلية
- جدول الحجوزات القادمة

#### 2. إدارة الحجوزات المتقدمة
- عرض معلومات العميل الكاملة
- خريطة موقع العميل
- إرسال إشعارات تلقائية
- تصدير البيانات (Excel)

#### 3. إدارة العروض
- معاينة الألوان
- إدارة فترات الصلاحية
- تتبع الاستخدام
- تمييز العروض

## 🔧 API Endpoints

### الحجوزات
```
GET    /api/bookings/              # قائمة الحجوزات
POST   /api/bookings/              # إنشاء حجز جديد
GET    /api/bookings/{id}/         # تفاصيل حجز
PUT    /api/bookings/{id}/         # تحديث حجز
DELETE /api/bookings/{id}/         # حذف حجز
```

### الخدمات
```
GET    /api/services/              # قائمة الخدمات
GET    /api/categories/           # فئات الخدمات
GET    /api/staff/                 # قائمة الموظفين
```

### العملاء
```
GET    /api/customers/             # قائمة العملاء
POST   /api/customers/             # تسجيل عميل جديد
GET    /api/customers/{id}/        # تفاصيل عميل
```

## 📱 Frontend Components

### الصفحات الرئيسية
- **HomePage**: الصفحة الرئيسية
- **ServicesPage**: صفحة الخدمات
- **BookingPage**: صفحة الحجز
- **AboutPage**: صفحة من نحن
- **ContactPage**: صفحة التواصل

### مكونات الحجز
- **BookingForm**: نموذج الحجز
- **TimeSlotSelector**: اختيار الوقت
- **ServiceSelector**: اختيار الخدمة
- **StaffSelector**: اختيار الموظف

## 🗄️ قاعدة البيانات

### الجداول الرئيسية
```sql
-- الحجوزات
bookings (id, customer_id, service_id, staff_id, booking_date, booking_time, status, price)

-- العملاء
customers (id, name, email, phone, date_of_birth, is_active)

-- الخدمات
services (id, name, price, duration, description, is_active)

-- الموظفين
staff (id, name, specialization, rating, is_active)

-- العناوين
addresses (id, customer_id, title, address, latitude, longitude, is_default)
```

## 🔐 المصادقة والأمان

### نظام المستخدمين
- **Superuser**: صلاحيات كاملة
- **Staff**: صلاحيات محدودة
- **Customer**: عملاء عاديون

### حماية البيانات
- تشفير كلمات المرور
- حماية من SQL Injection
- CSRF Protection
- CORS Configuration

## 📧 نظام الإشعارات

### أنواع الإشعارات
1. **إشعارات البريد الإلكتروني**
   - تأكيد الحجز
   - تذكير بالموعد
   - إلغاء الحجز

2. **إشعارات التطبيق**
   - تحديث حالة الحجز
   - عروض جديدة
   - رسائل إدارية

### إعدادات الإشعارات
```python
# في admin panel
NotificationSettings:
- email_booking_created: True/False
- email_booking_confirmed: True/False
- email_reminders: True/False
- in_app_notifications: True/False
```

## 🎨 التخصيص والتصميم

### الألوان والثيم
- ألوان مخصصة لكل فئة خدمة
- تصميم متجاوب (Responsive)
- دعم اللغة العربية
- أيقونات Font Awesome

### الصور والوسائط
- تحسين الصور تلقائياً
- دعم WebP
- معاينة الصور في Admin
- رفع متعدد الملفات

## 📊 التقارير والإحصائيات

### تقارير الحجوزات
- تقرير يومي/شهري/سنوي
- إحصائيات الموظفين
- تحليل الخدمات الأكثر طلباً
- معدل الإلغاء

### تقارير الإيرادات
- إجمالي الإيرادات
- مقارنة الفترات
- تحليل الاتجاهات
- تقارير الضرائب

## 🚀 النشر والإنتاج

### متطلبات الخادم
- Python 3.8+
- Node.js 16+
- PostgreSQL (اختياري)
- Nginx (اختياري)

### متغيرات البيئة
```bash
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost/db
ALLOWED_HOSTS=yourdomain.com
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

#### 1. خطأ في قاعدة البيانات
```bash
python manage.py migrate
python manage.py makemigrations
```

#### 2. مشاكل في الـ Admin
- تأكد من تسجيل النماذج في `admin.py`
- تحقق من imports في `admin_configs/`

#### 3. مشاكل في Frontend
```bash
npm install
npm run build
```

## 📞 الدعم والمساعدة

### ملفات مهمة للمراجعة
- `backend/salon/models.py` - نماذج البيانات
- `backend/salon/admin.py` - إعدادات Admin
- `backend/salon/views/` - منطق التطبيق
- `frontend/src/services/api.js` - API calls

### نصائح للمطور الجديد
1. ابدأ بفهم النماذج في `models.py`
2. راجع Admin configurations في `admin_configs/`
3. اختبر API endpoints باستخدام Postman
4. راجع Frontend components في `src/components/`

## 🔄 التحديثات المستقبلية

### ميزات مخططة
- [ ] نظام الدفع الإلكتروني
- [ ] تطبيق موبايل
- [ ] نظام الولاء
- [ ] تقارير متقدمة
- [ ] تكامل مع Google Calendar

### تحسينات الأداء
- [ ] Redis للـ Caching
- [ ] CDN للصور
- [ ] Database Indexing
- [ ] API Rate Limiting

---

**ملاحظة**: هذا المشروع تم تطويره بعناية مع التركيز على سهولة الصيانة والتطوير. جميع الملفات منظمة ومنسقة لسهولة الفهم والتعديل.
