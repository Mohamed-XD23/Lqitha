import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

async function main() {
  // أولاً — نتأكد أن يوجد مستخدم تجريبي
  const user = await db.user.upsert({
    where: { email: "test@lqitha.dz" },
    update: {},
    create: {
      name: "مستخدم تجريبي",
      email: "test@lqitha.dz",
      password: await bcrypt.hash("password123", 12),
    },
  });

  // ثانياً — ننشئ 25 بلاغ تجريبي لاختبار الـ Pagination
  const items = [
    {
      type: "LOST",
      title: "مفتاح سيارة تويوتا",
      category: "KEYS",
      description: "مفتاح سيارة تويوتا كورولا مع سلسلة مفاتيح حمراء",
      location: "الجزائر العاصمة",
    },
    {
      type: "FOUND",
      title: "هاتف iPhone 13",
      category: "PHONE",
      description: "هاتف أسود مع غلاف شفاف وجد في الحافلة رقم 26",
      location: "وهران",
    },
    {
      type: "LOST",
      title: "محفظة جلدية بنية",
      category: "WALLET",
      description: "محفظة بنية تحتوي على بطاقة هوية وبطاقة بنكية",
      location: "قسنطينة",
    },
    {
      type: "FOUND",
      title: "بطاقة هوية وطنية",
      category: "DOCUMENTS",
      description: "بطاقة هوية وجدت أمام مركز البريد",
      location: "عنابة",
    },
    {
      type: "LOST",
      title: "حقيبة مدرسية زرقاء",
      category: "OTHER",
      description: "حقيبة زرقاء تحتوي على كتب جامعية",
      location: "تيزي وزو",
    },
    {
      type: "FOUND",
      title: "سماعات AirPods",
      category: "ELECTRONICS",
      description: "سماعات أبيض اللون وجدت في المقهى",
      location: "الجزائر العاصمة",
    },
    {
      type: "LOST",
      title: "رخصة القيادة",
      category: "DOCUMENTS",
      description: "رخصة قيادة باسم أحمد، فُقدت في السوق",
      location: "سطيف",
    },
    {
      type: "FOUND",
      title: "مفاتيح شقة",
      category: "KEYS",
      description: "مجموعة مفاتيح مع سلسلة خضراء",
      location: "بجاية",
    },
    {
      type: "LOST",
      title: "Samsung Galaxy S22",
      category: "PHONE",
      description: "هاتف رمادي بغطاء أسود، الشاشة مكسورة قليلاً",
      location: "وهران",
    },
    {
      type: "FOUND",
      title: "محفظة سوداء",
      category: "WALLET",
      description: "محفظة سوداء فارغة وجدت في الشارع",
      location: "قسنطينة",
    },
    {
      type: "LOST",
      title: "نظارة طبية",
      category: "OTHER",
      description: "نظارة بإطار ذهبي رقم العدسة 2.5",
      location: "الجزائر العاصمة",
    },
    {
      type: "FOUND",
      title: "iPad mini",
      category: "ELECTRONICS",
      description: "جهاز iPad وجد في المكتبة الجامعية",
      location: "تلمسان",
    },
    {
      type: "LOST",
      title: "شهادة الميلاد",
      category: "DOCUMENTS",
      description: "شهادة ميلاد وبعض الوثائق الرسمية",
      location: "مستغانم",
    },
    {
      type: "FOUND",
      title: "مفتاح موتوسيكل",
      category: "KEYS",
      description: "مفتاح موتوسيكل مع بطاقة تعريف الدراجة",
      location: "عنابة",
    },
    {
      type: "LOST",
      title: "حقيبة يد نسائية",
      category: "OTHER",
      description: "حقيبة بيضاء تحتوي على مستلزمات شخصية",
      location: "الجزائر العاصمة",
    },
    {
      type: "FOUND",
      title: "Xiaomi Redmi Note 11",
      category: "PHONE",
      description: "هاتف أزرق وجد في المطعم",
      location: "ورقلة",
    },
    {
      type: "LOST",
      title: "بطاقة الطالب",
      category: "DOCUMENTS",
      description: "بطاقة طالب جامعة الجزائر 3",
      location: "الجزائر العاصمة",
    },
    {
      type: "FOUND",
      title: "سماعة بلوتوث",
      category: "ELECTRONICS",
      description: "سماعة JBL سوداء وجدت في الحديقة",
      location: "وهران",
    },
    {
      type: "LOST",
      title: "مفاتيح السيارة رينو",
      category: "KEYS",
      description: "مفاتيح رينو كليو مع جهاز التحكم عن بعد",
      location: "البليدة",
    },
    {
      type: "FOUND",
      title: "جواز السفر",
      category: "DOCUMENTS",
      description: "جواز سفر جزائري وجد في المطار",
      location: "الجزائر العاصمة",
    },
    {
      type: "LOST",
      title: "ساعة يد ذهبية",
      category: "OTHER",
      description: "ساعة ذهبية عليها نقش اسم سارة",
      location: "سكيكدة",
    },
    {
      type: "FOUND",
      title: "كمبيوتر محمول HP",
      category: "ELECTRONICS",
      description: "لابتوب HP أسود وجد في القاعة 12",
      location: "تيزي وزو",
    },
    {
      type: "LOST",
      title: "محفظة حمراء",
      category: "WALLET",
      description: "محفظة حمراء صغيرة بها صور عائلية",
      location: "قالمة",
    },
    {
      type: "FOUND",
      title: "مفتاح بيت مع كارطة",
      category: "KEYS",
      description: "مفاتيح مع بطاقة الحي الجامعي",
      location: "الجزائر العاصمة",
    },
    {
      type: "LOST",
      title: "حقيبة ظهر رياضية",
      category: "OTHER",
      description: "حقيبة Nike سوداء تحتوي على ملابس رياضية",
      location: "عين تموشنت",
    },
  ];

  // نستخدم createMany لإدخال كل البيانات دفعة واحدة
  for (const item of items) {
    await db.item.create({
      data: {
        ...item,
        type: item.type as "LOST" | "FOUND",
        category: item.category,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // تواريخ عشوائية في آخر 30 يوم
        phone: "0550000000",
        status: "ACTIVE",
        secretQuestion:
          item.type === "FOUND" ? "ما هو لون الغرض من الداخل؟" : null,
        secretAnswer:
          item.type === "FOUND" ? await bcrypt.hash("أحمر", 12) : null,
        userId: user.id,
      },
    });
  }

  console.log(`✅ تم إنشاء ${items.length} بلاغ تجريبي`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
