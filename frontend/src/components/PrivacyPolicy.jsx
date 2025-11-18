import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-salon-cream">

      {/* Hero Section */}
      <section className="bg-salon-gold text-text-on-gold py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">سياسة الخصوصية</h1>
          <p className="text-xl md:text-2xl font-light opacity-90">Privacy Policy</p>
          <div className="mt-6 flex items-center justify-center space-x-4 space-x-reverse text-sm">
            <span>📅 آخر تحديث: أكتوبر 2025</span>
            <span>•</span>
            <span>📍 المملكة العربية السعودية</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Privacy Notice */}
        <article className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-amber-600 flex items-center">
              <span className="inline-block w-2 h-8 bg-amber-500 ml-4"></span>
              إشعار الخصوصية (Glammy)
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                تحرص Glammy على بياناتك ومعلوماتك الشخصية وتلتزم بالحفاظ على سرية وخصوصية هذه البيانات واستخدامها للوصول إلى المستوى المأمول في تقديم الخدمات اللازمة بما يتوافق مع الشروط والأحكام المعمول بها في المملكة العربية السعودية، ويعد استخدام تطبيق Glammy وموقع Glammy الالكتروني وجميع الخدمات المرتبطة به بمثابة موافقة من المستخدم على إشعار الخصوصية الخاصة بالمستخدم.
              </p>
            </div>
          </div>

          {/* Section 1: Data We Collect */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              1. ما هي البيانات الشخصية التي نجمعها ونستخدمها
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-amber-600 text-xl ml-3">•</span>
                  <span className="text-gray-700 text-lg">الاسم</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 text-xl ml-3">•</span>
                  <span className="text-gray-700 text-lg">البريد الإلكتروني</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 text-xl ml-3">•</span>
                  <span className="text-gray-700 text-lg">رقم الجوال</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 text-xl ml-3">•</span>
                  <span className="text-gray-700 text-lg">تاريخ الميلاد</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 text-xl ml-3">•</span>
                  <span className="text-gray-700 text-lg">الموقع</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Why We Collect Data */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              2. لماذا نجمع بياناتك الشخصية ونستخدمها
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                يتم جمع بياناتك الشخصية من أجل إكمال عمليات الشراء وتشغيل الخدمة والمحافظة على جودة الخدمات وتوفير إحصائيات عامة بشأن موقع وتطبيق Glammy، ومن أجل إبلاغك بمنتجات أو خدمات أخرى من Glammy أو الكيانات التجارية التابعة لها.
              </p>
            </div>
          </section>

          {/* Section 3: How We Collect Data */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              3. كيف نجمع بياناتك الشخصية
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6 space-y-4">
              <div className="flex items-start">
                <div className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center ml-3 flex-shrink-0">
                  <span className="font-bold">أ</span>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  يتم جمع البيانات التي يقوم صاحب البيانات الشخصية بتزويد الموقع بها عن طريق التسجيل، ولا يتم جمع بيانات شخصية من أي جهات أخرى.
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center ml-3 flex-shrink-0">
                  <span className="font-bold">ب</span>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  يتم جمع بياناتك الشخصية بطريقة غير مباشرة عن طريق ملفات الارتباط التي يتم جمعها عند زيارة الموقع (Cookies).
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Data Retention */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              4. ما مدة احتفاظنا ببياناتك الشخصية
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                يتم تخزين البيانات الشخصية طالما كانت ضرورية للأغراض التي جمعت من أجلها وفقًا لفترات الاحتفاظ المحددة.
              </p>
            </div>
          </section>

          {/* Section 5: Data Protection */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              5. حماية البيانات والإفصاح عنها
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                تلتزم Glammy باتخاذ جميع الإجراءات الأمنية والتقنية اللازمة لحماية بياناتك الشخصية من أي وصول غير مصرح به أو استخدام غير قانوني أو تغيير أو إتلاف أو فقدان.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                لا نفصح عن معلوماتك الشخصية لأي طرف ثالث إلا في الحالات التالية:
              </p>
              <ul className="mt-4 space-y-2 mr-6">
                <li className="flex items-start">
                  <span className="text-amber-600 text-xl ml-3">•</span>
                  <span className="text-gray-700">عند وجود التزام قانوني أو قضائي بالإفصاح</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 text-xl ml-3">•</span>
                  <span className="text-gray-700">عند الحاجة لحماية حقوقنا أو ممتلكاتنا أو سلامة المستخدمين</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 text-xl ml-3">•</span>
                  <span className="text-gray-700">مع مقدمي الخدمات الموثوقين الذين يساعدوننا في تشغيل خدماتنا</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Data Security Section */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              6. حماية وأمان البيانات
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                يتم حفظ البيانات في قواعد بيانات مشفرة ومؤمنة داخل المملكة العربية السعودية ذات وصول محدود ومحوكم بصلاحيات محدودة في لوحة التحكم يتم استخدام تعمية البيانات لعدم ظهور الاسم أو رقم الجوال كاملا، ولا يتم الكشف عن هذه البيانات إلا عند توافقها مع القانون.
              </p>
            </div>
          </section>

          {/* Legal Basis Section */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              7. الأساس النظامي لجمع ومعالجة بياناتك الشخصية
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                يتم جمع ومعالجة البيانات الشخصية بناء على موافقة صاحب البيانات الشخصية، ويمكنك الرجوع عن الموافقة على جمع ومعالجة بياناته الشخصية في أي وقت ما لم يكن هناك أساس نظامي آخر، وللقيام بذلك يمكنك التواصل على البريد الإلكتروني : info@glammy.com.
              </p>
            </div>
          </section>

          {/* Customer Rights Section */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              8. حقوق العملاء
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">الحق في العلم</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  يحق لصاحب البيانات الشخصية معرفة طرق جمعنا لبياناته والأساس النظامي لجمعها ومعالجتها، وكيفية معالجتها وحفظها وإتلافها ومع من ستتم مشاركتها ويمكنك الاطلاع على كافة التفاصيل من خلال إشعار الخصوصية أو من خلال التواصل معنا عبر البريد الالكتروني.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">الحق في الوصول إلى البيانات الشخصية</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  يحق لصاحب البيانات الشخصية أن يطلب نسخة من بياناته الشخصية، وذلك عن طريق التواصل عبر البريد الإلكتروني.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">الحق في تصحيح البيانات الشخصية</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  يحق لصاحب البيانات الشخصية أن يطلب تصحيح بياناته الشخصية التي يرى أنها غير دقيقة أو غير صحيحة أو غير مكتملة، وذلك عن طريق البريد الإلكتروني، وسيتم إشعار صاحب البيانات الشخصية بذلك عن طريق البريد الإلكتروني.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">الحق في إتلاف البيانات الشخصية</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  يحق لصاحب البيانات الشخصية أن يطلب إتلاف بياناته الشخصية في ظروف معينة ما لم يكن هناك أساس نظامي آخر، أو يحدد مدة معينة للاحتفاظ أو متطلبات تعاقدية.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">الحق في الرجوع عن الموافقة على معالجة البيانات الشخصية</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  يمكن صاحب البيانات الشخصية الرجوع عن الموافقة على معالجة بياناته الشخصية ما لم تكن هناك أغراض مشروعة تتطلب عكس ذلك.
                </p>
              </div>
            </div>
          </section>

          {/* Data Sharing Section */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              9. مشاركة وتبادل بياناتك الشخصية
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                قد تشارك Glammy بياناتك الشخصية مع أشخاص آخرين لأغراض تسويقية، ويجوز لهم مشاركة البيانات الشخصية مع أطراف أخرى، في حال كنت ترغب بعدم مشاركة البيانات الشخصية مع أشخاص آخرين الأغراض التسويق يمكنك التوصل على البريد الالكتروني:
              </p>
              <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                <p className="text-amber-700 font-semibold">info@glammy.com</p>
              </div>
            </div>
          </section>

          {/* App Privacy Information */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              10. معلومات الخصوصية الخاصة بموقع Glammy والتطبيق الالكتروني
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">حزم Firebase</h3>
                <p className="text-gray-700 leading-relaxed text-lg mb-4">
                  تستخدم Glammy معلومات التطبيق المثبتة مع حزم Firebase من أجل تحسين تجربة المستخدم
                </p>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold text-gray-800 mb-2">المراسلة السحابية</h4>
                    <p className="text-gray-700 text-sm">مثل إصدار التطبيق، وكيل مستخدم Firebase</p>
                    <a href="#" className="text-amber-600 hover:text-amber-700 text-sm">تحقق من هذا الرابط لمزيد من التفاصيل</a>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold text-gray-800 mb-2">الروابط الديناميكية</h4>
                    <p className="text-gray-700 text-sm">مثل اسم حزمة التطبيق، ربط أحداث التفاعل</p>
                    <a href="#" className="text-amber-600 hover:text-amber-700 text-sm">تحقق من هذا الرابط لمزيد من التفاصيل</a>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold text-gray-800 mb-2">تحليلات Firebase</h4>
                    <p className="text-gray-700 text-sm">مثل (معرف الإعلان، أحداث دورة حياة التطبيق)</p>
                    <a href="#" className="text-amber-600 hover:text-amber-700 text-sm">تحقق من هذا الرابط لمزيد من التفاصيل</a>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">تحليل إحصائي وتقديم محتوى مخصص</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  نقوم بإجراء تحليل إحصائي وتقديم محتوى مخصص لتحسين تجربتك مع التطبيق.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">تقنية UXCam</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  تقنية UXCam المتخصصة في تحليل تطبيقات الجوال، والتي تتيح لنا فهما عميقًا لتجربة المستخدم وتضمن سلاسة الأداء وكفاءته دون التأثير على سرعة التطبيق. وتُعرف UXCam بريادتها في مجال تحليل التطبيقات بفضل استخدامها لـ SDK خفيف الوزن الذي لا يثقل على الأداء. كما تتيح لنا خاصية التقاط البيانات التلقائية (Tagless autocapture) والتي نستخدمها في رصد تجربة المستخدم الحقيقية بدقة لمساعدتنا على تحسين التطبيق باستمرار لتلبية احتياجات وتطلعات عملائنا.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information Extended */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              11. اتصل بنا
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">البريد الإلكتروني</h3>
                  <p className="text-amber-600 font-semibold">info@glammy.com</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">الهاتف</h3>
                  <p className="text-amber-600 font-semibold">055352227</p>
                </div>
              </div>
            </div>
          </section>

          {/* Complaints Section */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              12. الشكاوى والاستفسارات
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                في حال وجود شكوى أو استفسار متعلق بإشعار الخصوصية أو التعامل مع البيانات الشخصية تواصل مع إدارة الموقع عبر البريد الإلكتروني.
              </p>
            </div>
          </section>

          {/* Terms and Conditions */}
          <section className="mb-10 border-r-4 border-amber-500 pr-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              13. البنود والشروط العامة
            </h2>
            <div className="bg-gradient-to-l from-amber-50 to-transparent rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed text-lg mb-6 font-semibold">
                يقر العميل بقبول البنود والشروط العامة التالية:
              </p>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">1. التعامل مع أخصائية التجميل</h3>
                  <p className="text-gray-700 leading-relaxed">
                    يجب التعامل مع أخصائية التجميل وفقًا لأحكام الشريعة الإسلامية وأنظمة العمل في المملكة العربية السعودية.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">2. مسؤولية شركة Glammy المحدودة</h3>
                  <p className="text-gray-700 leading-relaxed">
                    تكون شركة Glammy المحدودة مسؤولة عن تعيين أخصائية التجميل بناءً على مراجعة أداء الأخصائية ومدى توفرها.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">3. طلب أخصائية تجميل محددة</h3>
                  <p className="text-gray-700 leading-relaxed">
                    يمكن للعميل فقط طلب أخصائية تجميل محددة طالما أنه ليس لديها أي حجز آخر في ذات الوقت، وستعمل شركة Glammy المحدودة على توفيرها قدر الإمكان.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">4. تقديم أخصائية التجميل المطلوبة</h3>
                  <p className="text-gray-700 leading-relaxed">
                    في حال تمكن شركة Glammy المحدودة من تقديم أخصائية التجميل المطلوبة وذلك بناءً على توفرها بشرط أن يتم طلب حجزها قبل الموعد بما لا يقل عن 24 ساعة من الموعد ولا ينطبق ذلك على مواعيد الإجازة الأسبوعية او الأعياد إلا قبل الموعد بـ 72 ساعة.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">5. مسؤولية العميل في الاستقبال</h3>
                  <p className="text-gray-700 leading-relaxed">
                    العميل مسؤول عن استقبال أخصائية التجميل خلال موعد الوصول المحدد وفقًا لوقت الحجز، وفي نفس الموقع الذي اختاره أثناء الحجز.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">6. مسؤولية العميل عن الموقع</h3>
                  <p className="text-gray-700 leading-relaxed">
                    يتحمل العميل المسؤولية عن الموقع المحدد أثناء الحجز، ولن يتم اعتبار أي موقع آخر يطلبه العميل صالحاً إلا إذا أبلغ شركة Glammy المحدودة بذلك قبل يوم واحد أو أكثر من الحجز عن طريق القنوات الإلكترونية.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">7. تقديم الخدمة</h3>
                  <p className="text-gray-700 leading-relaxed">
                    تعد الخدمة مقدمة عند وصول الفريق للموقع، ولا يمكن استرجاع المبلغ في حال عدم استقبال اخصائية التجميل في الموعد والموقع المحددين في التطبيق.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">8. مسؤولية شركة Glammy المحدودة عن التوقيت</h3>
                  <p className="text-gray-700 leading-relaxed">
                    تكون شركة Glammy المحدودة مسؤولة عن تقديم الخدمة في الوقت المتفق عليه ( مع إمكانية التأخير أو التقديم - 1 + 120 دقيقة ) ، حسب حركة سير المرور وسيبدأ التوقيت عند استقبال العميل لأخصائية التجميل وابتداء الخدمة وفقًا للتاريخ والوقت المحدد في الفاتورة.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">9. فشل العميل في الاستقبال</h3>
                  <p className="text-gray-700 leading-relaxed">
                    في حالة فشل العميل في استقبال أخصائية التجميل خلال (15) دقيقة من وقت الوصول والحجز، سيتم اعتبار الزيارة مقدمة ولن يتم تعويضها.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">10. الخدمة للسيدات فقط</h3>
                  <p className="text-gray-700 leading-relaxed">
                    يتم تقديم هذه الخدمة للسيدات فقط ولن يتم تسليم أخصائية التجميل إلى العميل ما لم تكن هناك سيدة متواجدة في المنزل لاستقبال الخدمة. وفي حال عدم وجود السيدة المخصصة للخدمة في المنزل، سيتم اعتبار الزيارة مقدمة، وفي مثل هذه الحالة لن يتم مطالبة شركة Glammy المحدودة بالتعويض عن الزيارة أو استرجاع أي مبالغ مالية.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">11. مسؤولية العميل عن الممتلكات</h3>
                  <p className="text-gray-700 leading-relaxed">
                    العميل مسؤول عن حماية ممتلكاته ومقتنياته الثمينة من الضرر أو الفقدان (أثاث، ديكور، ملابس ومجوهرات.. إلخ)، وفي حالة فقدان أو ضررها، ولن تتحمل شركة Glammy المحدودة المسؤولية عند الإخلال بالشرط ولن يتم التعويض. وسيتم التعامل مع القضايا بموجب القوانين المختصة بالمملكة، وستظل المسؤولية تقع على عاتق أخصائية التجميل، أو العميل حتى إشعار قانوني آخر.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">12. مسؤولية العميل عن أخصائية التجميل</h3>
                  <p className="text-gray-700 leading-relaxed">
                    العميل مسؤول عن أخصائية التجميل خلال فترة الزيارة وبعد استقبالها. سوف يتواجد ممثل شركة Glammy المحدودة في الموقع المتفق في التطبيق لتحصيل أخصائية التجميل ولن يسمح لها بالخروج من الموقع المتفق عليه لأي سبب من الأسباب قبل وصول ممثل شركة Glammy المحدودة في نهاية الموعد المحدد.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">13. الحالات الطارئة</h3>
                  <p className="text-gray-700 leading-relaxed">
                    في حالة حدوث أي حالات طارئة تحتاج إلى رعاية طبية أو تتضمن اعتداء جسدي، يجب على العميل إبلاغ شركة Glammy المحدودة مباشرة عن طريق الاتصال برقم مركز الاتصال (0553522207). وسيتم التعامل مع القضايا من خلال الإجراءات والقواعد القانونية في المملكة العربية السعودية.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">14. الخدمات المدفوعة</h3>
                  <p className="text-gray-700 leading-relaxed">
                    ستؤدي أخصائية التجميل الخدمات المدفوعة بالحجز الذي تم إجراؤه فقط (مثل خدمات الشعر، الأظافر، التدليك، الحمام المغربي، العناية بالجسم والعناية بالبشرة مع عدم تقديم أي خدمة إضافية غير مدفوعة إلا في حال قرر العميل إضافة خدمة يتطلب دفع قيمة الخدمة المضافة بواسطة جهاز الدفع (span).
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">15. منطقة تجهيز الأدوات</h3>
                  <p className="text-gray-700 leading-relaxed">
                    العميل مسؤول مسؤولية تامة عن توفير منطقة لتجهيز أدوات الخدمة لأخصائية التجميل.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">16. منع تقديم الهدايا</h3>
                  <p className="text-gray-700 leading-relaxed">
                    لا يجوز تقديم هدايا بشكل مادي، إلى أخصائية التجميل لأي سبب من الأسباب.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">17. الدفع المقدم</h3>
                  <p className="text-gray-700 leading-relaxed">
                    العميل مسؤول عن دفع إجمالي قيمة الحجز مقدمًا عند الحجز عبر التطبيق بما لا يقل عن القيمة المحددة في التطبيق.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">18. تعديل الأسعار</h3>
                  <p className="text-gray-700 leading-relaxed">
                    يحق لشركة Glammy المحدودة تعديل أسعار الحجز حسب التغييرات التي تفرضها الحكومة مثل أي رسوم حكومية مثل الضرائب أو أي رسوم حكومية أخرى. سيتم تحصيل الرسوم من الطرف الثاني عندما يصبح ذلك ساريًا للتحصيل أو ثابتًا في التطبيق.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">19. إلغاء أو تعديل الموعد</h3>
                  <p className="text-gray-700 leading-relaxed">
                    لا يمكن للعميل إلغاء أو تعديل موعد أو استرجاع فاتورة لأي حجوزات في نفس اليوم مطلقاً، ويمكن إلغاء الخدمة خلال مدة لا تزيد عن 24 ساعة من حجز الموعد في التطبيق، وسيتم خصم 25% من القيمة الإجمالية كرسوم إدارية.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">20. تعديل الموعد ذاتياً</h3>
                  <p className="text-gray-700 leading-relaxed">
                    يمكن للعميل إجراء تعديل الموعد ذاتياً من خلال التطبيق مرة واحدة فقط بشرط أن يكون ذلك قبل وقت الموعد بما لا يقل عن 24 ساعة.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">21. جدولة الخدمة بعد وصول الفريق</h3>
                  <p className="text-gray-700 leading-relaxed">
                    لا يمكن للعميل جدولة الخدمة المحجوزة / أو تغيير الموقع المحدد في التطبيق بعد وصول الفريق للموقع المحدد مسبقاً. وتعتبر الخدمة مقدمة في حال عدم الاستفادة منها.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">22. الحجز في مناطق غير مشمولة</h3>
                  <p className="text-gray-700 leading-relaxed">
                    في حال حجز العميل في مدينة أو منطقة أو حي غير مشمول في التطبيق ولم يتم إشعار الفريق بالخطأ قبل 24 ساعة من الموعد تعد الخدمة مقدمة.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">23. وسائل الدفع</h3>
                  <p className="text-gray-700 leading-relaxed">
                    يمكن إبرام دفع تكاليف الخدمة باستخدام Apple pay أو MADA أو STC pay، أو أي وسيلة أخرى يتم اعتمادها في التطبيق.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">24. نقل أخصائية التجميل</h3>
                  <p className="text-gray-700 leading-relaxed">
                    لا يحق للعميل نقل أخصائية التجميل إلى طرف ثالث، أو استخدام أخصائية التجميل للآخرين / أو طلب تغيير الخدمة من الأخصائية، أو نقلها من الموقع المسجل على النحو المتفق عليه في العقد، ما لم يتم الموافقة المسبقة ومعرفة شركة Glammy المحدودة وفي حالة انتهاك هذا البند، يحق لشركة Glammy المحدودة إنهاء العقد دون تعويض العميل.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">25. خرق الشروط والأحكام</h3>
                  <p className="text-gray-700 leading-relaxed">
                    في حالة حدوث خرق لأي من شروط وأحكام الحجز في التطبيق، أو الاعتداء أو المضايقة من أخصائية التجميل، يحق لشركة Glammy المحدودة إنهاء العقد دون الرجوع إلى العميل، ولا يحق للعميل المطالبة بأي تعويض، بينما يحتفظ لشركة Glammy المحدودة بالحق في رفع دعوى قضائية أمام المحاكم المختصة في المملكة العربية السعودية.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">26. استرداد المبالغ</h3>
                  <p className="text-gray-700 leading-relaxed">
                    يتم استرداد المبالغ المقرر استرجاعها المتوافقة مع الشروط والأحكام من خلال التطبيق خلال 14 - 30 يوم عمل بحد أقصى وفي حال التأخر المرجو التواصل مع الدعم الفني لخدمتكم بشكل أفضل.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">27. تجميع الخدمات من الصوالين</h3>
                  <p className="text-gray-700 leading-relaxed">
                    يعمل تطبيق Glammy على تجميع الخدمات من الصوالين (مقدمي الخدمة التي تتوفر في كل مدينة داخل المملكة وخارجها وقد تتغير الشروط والأحكام بحسب الدولة أو المدينة أو بحسب نوع مقدم الخدمة ويمكن تتبع ذلك عند اختيار مقدم الخدمة المطلوب في التطبيق بحسب الخدمة أو المنتج أو العرض أو الخصم المطلوب.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">28. تصحيح الأخطاء التقنية</h3>
                  <p className="text-gray-700 leading-relaxed">
                    يحق لإدارة Glammy تصحيح أي خلل تقني وحذف السجلات عند الضرورة.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">29. الكوبونات</h3>
                  <p className="text-gray-700 leading-relaxed">
                    الكوبونات لا تُطبق على الأسعار المخفضة.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">30. اختلاف الأسعار حسب الفترات الزمنية</h3>
                  <p className="text-gray-700 leading-relaxed">
                    عند الحجز، يمكن أن تختلف الأسعار حسب الفترات الزمنية المتاحة. لكن عند التعديل، لا توجد أسعار أقل أو أعلى، حيث يتم احتساب السعر بناءً على السعر الأساسي للخدمة فقط. في حالة التعديل، يدفع العميل الحد الأدنى لقيمة الطلب أو رسوم الإلغاء، ولا يتم استرداد أي فرق في السعر.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-bold text-gray-800 mb-2">31. تأخير التوصيل خلال العيد والمواسم</h3>
                  <p className="text-gray-700 leading-relaxed">
                    يرجى ملاحظة أنه قد يتم تأخير توصيل المنتجات خلال فترات العيد والمواسم بسبب إجازات شركات الشحن.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mt-12 border-t-2 border-amber-200 pt-8">
            <h2 className="text-2xl font-bold mb-4 text-amber-600">تواصل معنا</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              إذا كان لديك أي استفسارات حول سياسة الخصوصية هذه أو حول كيفية تعاملنا مع بياناتك الشخصية، يرجى التواصل معنا:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <p className="flex items-center text-gray-700">
                <svg className="w-5 h-5 ml-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>info@glammy.sa</span>
              </p>
              <p className="flex items-center text-gray-700">
                <svg className="w-5 h-5 ml-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>+966 XX XXX XXXX</span>
              </p>
              <p className="flex items-center text-gray-700">
                <svg className="w-5 h-5 ml-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>المملكة العربية السعودية</span>
              </p>
            </div>
          </section>
        </article>

        {/* Quick Links Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-amber-600">روابط مفيدة</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/terms" className="flex items-center p-4 rounded-lg border-2 border-amber-200 hover:border-amber-500 transition-colors duration-200">
              <svg className="w-6 h-6 text-amber-600 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span className="font-medium text-gray-700">الشروط والأحكام</span>
            </Link>
            <Link to="/contact" className="flex items-center p-4 rounded-lg border-2 border-amber-200 hover:border-amber-500 transition-colors duration-200">
              <svg className="w-6 h-6 text-amber-600 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <span className="font-medium text-gray-700">تواصل معنا</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
