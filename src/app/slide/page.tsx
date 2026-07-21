import type { Metadata } from "next";
import Image from "next/image";
import { Kanit, Sarabun } from "next/font/google";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  CalendarDays,
  ChartPie,
  CheckSquare2,
  Database,
  FileCheck2,
  FileSignature,
  Flag,
  ChartNoAxesCombined,
  CloudUpload,
  Hospital,
  HousePlus,
  ListChecks,
  ListTodo,
  RefreshCcw,
  Route,
  Server,
  Share2,
  ShieldCheck,
  Square,
  Stethoscope,
  UserCog,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import styles from "./slide.module.css";

const kanit = Kanit({
  variable: "--font-slide-heading",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const sarabun = Sarabun({
  variable: "--font-slide-body",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "การพัฒนาระบบข้อมูลด้านสุขภาพระดับอำเภอ",
  description: "การพัฒนาระบบข้อมูลด้านสุขภาพระดับอำเภอ ปีงบประมาณ 2569–2570",
};

export const dynamic = "force-static";

type SlideItemProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
};

function SlideMeta({ number }: { number: string }) {
  return (
    <div className={styles.slideMeta}>
      <div className={styles.department}>กลุ่มงานสุขภาพดิจิทัล</div>
      <div className={styles.slideNumber}>{number}</div>
    </div>
  );
}

function SlideFooter() {
  return (
    <div className={styles.footer}>
      <CalendarDays aria-hidden="true" size={15} />
      การพัฒนาระบบข้อมูล ปีงบ 2569–2570
    </div>
  );
}

function SlideItem({ icon: Icon, title, subtitle }: SlideItemProps) {
  return (
    <div className={styles.item}>
      <div className={styles.iconBox}>
        <Icon aria-hidden="true" size={26} strokeWidth={2.3} />
      </div>
      <div className={styles.itemText}>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function Kicker({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className={styles.kicker}>
      <Icon aria-hidden="true" size={18} />
      {children}
    </div>
  );
}

const problemItems: SlideItemProps[] = [
  {
    icon: Database,
    title: "ปัญหาการบันทึก และส่งต่อข้อมูล",
    subtitle: "บันทึกไม่ครบถ้วน ไม่รู้รายชื่อประชากรเป้าหมาย ให้รหัสผิด ส่งไม่ทันเวลา",
  },
  {
    icon: RefreshCcw,
    title: "ระบบ HDC /สปสช ประมวลผลช้า",
    subtitle: "HDC / สปสช ประมวลผลช้า ทำให้แก้ไขไม่ทันเวลา",
  },
  {
    icon: UserRoundCheck,
    title: "มีความยุ่งยากในการตรวจสอบข้อมูลเฉพาะราย",
    subtitle: "เนื่องจากระบบ HDC/ สปสช ส่วนกลาง ต้องปฏิบัติตาม PDPA",
  },
];

const strategyItems: SlideItemProps[] = [
  {
    icon: UsersRound,
    title: "จัดตั้งคณะทำงานพัฒนาระบบข้อมูล 9 อำเภอ 9 ทีม",
    subtitle: "คำสั่งสำนักงานสาธารณสุขจังหวัดพิษณุโลก ที่ ๑๙๓/๒๕๖๙",
  },
  {
    icon: Server,
    title: "จัดทำระบบศูนย์ข้อมูล (Data Hub) ระดับอำเภอ",
    subtitle: "ทุกอำเภอมีระบบศูนย์ข้อมูลที่ได้มาตรฐานความปลอดภัย ใช้งานได้รวดเร็ว",
  },
  {
    icon: ListChecks,
    title: "เป็นเครื่องมือกำกับ ติดตาม เพิ่มคุณภาพข้อมูลระดับอำเภอ",
    subtitle: "จัดทำบัญชีรายชื่อเป้าหมาย รายชื่อส่วนขาด ติดตามความก้าวหน้าในอำเภอ",
  },
];

const outcomeItems: SlideItemProps[] = [
  {
    icon: ChartPie,
    title: "Dashboard กลางระดับจังหวัด",
    subtitle: "เชื่อมโยงข้อมูลจากระบบศูนย์ข้อมูลของทุกอำเภอแบบเรียลไทม์",
  },
  {
    icon: Bot,
    title: "ระบบสอบถามและวิเคราะห์ข้อมูลด้วย AI",
    subtitle: "ใช้งานง่าย พร้อมมาตรการความปลอดภัยของข้อมูล",
  },
  {
    icon: UserCog,
    title: "ผู้ปฏิบัติงาน ผู้รับผิดชอบงานดึงข้อมูลได้",
    subtitle: "ดึงข้อมูลที่ซับซ้อนได้ด้วยตนเอง ไม่ต้องรอนักไอที",
  },
  {
    icon: FileCheck2,
    title: "หน่วยบริการเคลมได้ ผลงานดี",
    subtitle: "ข้อมูลครบถ้วน ถูกต้อง ส่งเคลมได้ และสะท้อนผลงานอย่างมีประสิทธิภาพ",
  },
];

const progressRows = [
  { activity: "จัดตั้งคณะทำงาน", period: "มิ.ย. 2569", done: true },
  { activity: "จัดทำระบบศูนย์ข้อมูลครบทุกอำเภอ", period: "มิ.ย. 2569", done: true },
  { activity: "จัดทำ Dashboard กลางระดับจังหวัด", period: "ส.ค. – ก.ย. 2569", done: false },
  { activity: "ระบบสอบถามและวิเคราะห์ข้อมูลด้วย AI ที่มีความปลอดภัย", period: "ต.ค. 2569", done: false },
  {
    activity: "ประเมินผลสำเร็จ บันทึกถูกต้อง ครบถ้วน ส่งทัน นำกลับมาใช้งานได้",
    period: "ก.ค. 2570",
    done: false,
  },
];

export default function SlidePage() {
  return (
    <main className={`${styles.deck} ${kanit.variable} ${sarabun.variable}`}>
      <section id="1" className={`${styles.slide} ${styles.cover}`}>
        <SlideMeta number="01 / 06" />
        <div className={styles.visual}>
          <Image
            src="/slide/health-data-profile.png"
            alt="Profile ข้อมูลสุขภาพที่ครบถ้วน ถูกต้อง ทันเวลา และนำกลับมาใช้งานได้"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 486px"
          />
        </div>
        <div className={`${styles.content} ${styles.coverContent}`}>
          <div className={styles.coverRule} />
          <h1 className={styles.coverTitle}>
            <span className={styles.coverLine1}>การพัฒนาระบบข้อมูลด้านสุขภาพระดับอำเภอ</span>
            <span className={styles.coverLine2}>เพื่อความครบถ้วน ถูกต้อง ทันเวลา</span>
            <span className={styles.coverLine3}>นำกลับมาใช้งานได้</span>
          </h1>
          <SlideFooter />
        </div>
      </section>

      <section id="2" className={`${styles.slide} ${styles.problem}`}>
        <SlideMeta number="02 / 06" />
        <div className={styles.visual}>
          <Image
            src="/slide/nurse-hdc-nhso-cloud.png"
            alt="พยาบาลบันทึกข้อมูลและเชื่อมต่อระบบ HDC กับ สปสช"
            fill
            sizes="(max-width: 900px) 100vw, 486px"
          />
          <span className={`${styles.cloudLabel} ${styles.hdcLabel}`}>HDC</span>
          <span className={`${styles.cloudLabel} ${styles.nhsoLabel}`}>สปสช.</span>
        </div>
        <div className={styles.content}>
          <Kicker icon={Database}>สถานการณ์ปัจจุบัน</Kicker>
          <h2>ปัญหาที่พบในปีงบประมาณ 2569</h2>
          <div className={styles.items}>
            {problemItems.map((item) => (
              <SlideItem key={item.title} {...item} />
            ))}
          </div>
          <SlideFooter />
        </div>
      </section>

      <section id="3" className={`${styles.slide} ${styles.strategy}`}>
        <SlideMeta number="03 / 06" />
        <div className={`${styles.visual} ${styles.mapVisual}`}>
          <Image
            src="/slide/district-datahub-map.png"
            alt="แผนที่ 9 อำเภอ พร้อม Data Hub ที่มีมาตรฐานความปลอดภัย"
            fill
            sizes="(max-width: 900px) 100vw, 486px"
          />
        </div>
        <div className={styles.content}>
          <Kicker icon={Route}>แนวทางขับเคลื่อน</Kicker>
          <h2>กลยุทธ์การดำเนินงาน</h2>
          <div className={styles.items}>
            {strategyItems.map((item, index) => (
              <div key={item.title} className={styles.item}>
                <div className={styles.iconBox}>
                  <item.icon aria-hidden="true" size={26} strokeWidth={2.3} />
                </div>
                <div className={styles.itemText}>
                  <strong>{item.title}</strong>
                  <span>
                    {index === 0 && <FileSignature aria-hidden="true" size={16} />}
                    {item.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <SlideFooter />
        </div>
      </section>

      <section id="4" className={`${styles.slide} ${styles.flow}`}>
        <SlideMeta number="04 / 06" />
        <div className={styles.flowContent}>
          <Kicker icon={Share2}>DATA FLOW</Kicker>
          <h2>รูปแบบการส่งต่อข้อมูล</h2>

          <div className={styles.flowStage}>
            <div className={`${styles.flowLayerHead} ${styles.flowLayerOne}`}>หน่วยบริการ</div>
            <div className={`${styles.flowLayerHead} ${styles.flowLayerTwo}`}>ศูนย์ข้อมูลอำเภอ</div>
            <div className={`${styles.flowLayerHead} ${styles.flowLayerThree}`}>Dashboard ระดับจังหวัด</div>

            <svg className={styles.flowLines} viewBox="0 0 1152 446" aria-hidden="true">
              <defs>
                <marker id="flow-arrow-main" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#2f7de1" />
                </marker>
                <marker id="flow-arrow-central" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#e05252" />
                </marker>
              </defs>

              <path d="M255 114 L417 114" fill="none" stroke="#2f7de1" strokeWidth="4" markerEnd="url(#flow-arrow-main)" />
              <path d="M255 218 L417 218" fill="none" stroke="#2f7de1" strokeWidth="4" markerEnd="url(#flow-arrow-main)" />
              <path d="M255 322 L417 322" fill="none" stroke="#2f7de1" strokeWidth="4" markerEnd="url(#flow-arrow-main)" />

              <path d="M680 114 C750 114 770 110 805 110 H842" fill="none" stroke="#21a06b" strokeWidth="4" markerEnd="url(#flow-arrow-main)" />
              <path d="M680 218 C750 218 770 165 805 165 H842" fill="none" stroke="#21a06b" strokeWidth="4" markerEnd="url(#flow-arrow-main)" />
              <path d="M680 322 C750 322 770 220 805 220 H842" fill="none" stroke="#21a06b" strokeWidth="4" markerEnd="url(#flow-arrow-main)" />

              <path d="M278 350 V390 H790 V352 H820" fill="none" stroke="#e05252" strokeWidth="3" strokeDasharray="9 6" />
              <path d="M820 352 H842" fill="none" stroke="#e05252" strokeWidth="3" markerEnd="url(#flow-arrow-central)" />
              <circle cx="278" cy="350" r="5" fill="#e05252" />

              <path d="M985 250 V263 M985 291 V304" fill="none" stroke="#7d899b" strokeWidth="2.5" strokeDasharray="5 5" />
              <circle cx="985" cy="250" r="4" fill="#7d899b" />
              <circle cx="985" cy="304" r="4" fill="#7d899b" />
            </svg>

            <div className={`${styles.flowNode} ${styles.serviceNode} ${styles.flowRowOne}`}>
              <div className={styles.flowNodeIcon}><Hospital aria-hidden="true" size={23} /></div>
              <div className={styles.flowNodeCopy}><strong>โรงพยาบาล</strong><span>บันทึกและส่งข้อมูล</span></div>
            </div>
            <div className={`${styles.flowNode} ${styles.serviceNode} ${styles.flowRowTwo}`}>
              <div className={styles.flowNodeIcon}><Stethoscope aria-hidden="true" size={23} /></div>
              <div className={styles.flowNodeCopy}><strong>รพ.สต. สังกัด สธ.</strong><span>บันทึกและส่งข้อมูล</span></div>
            </div>
            <div className={`${styles.flowNode} ${styles.serviceNode} ${styles.flowRowThree}`}>
              <div className={styles.flowNodeIcon}><HousePlus aria-hidden="true" size={23} /></div>
              <div className={styles.flowNodeCopy}><strong>รพ.สต. สังกัด อปท.</strong><span>บันทึกและส่งข้อมูล</span></div>
            </div>

            {[styles.flowRowOne, styles.flowRowTwo, styles.flowRowThree].map((rowClass) => (
              <div key={rowClass} className={`${styles.flowNode} ${styles.hubNode} ${rowClass}`}>
                <div className={styles.flowNodeIcon}>
                  <Database aria-hidden="true" size={23} />
                  <span className={styles.securityBadge}><ShieldCheck aria-hidden="true" size={14} /></span>
                </div>
                <div className={styles.flowNodeCopy}>
                  <strong>Data Hub อำเภอ</strong>
                  <ul className={styles.hubBullets}>
                    <li>ตรวจสอบ</li>
                    <li>เพิ่มคุณภาพ</li>
                    <li>ใช้ประโยชน์ในอำเภอ</li>
                  </ul>
                </div>
              </div>
            ))}

            <div className={`${styles.flowNode} ${styles.dashboardNode}`}>
              <div className={styles.flowNodeIcon}><ChartNoAxesCombined aria-hidden="true" size={28} /></div>
              <div className={styles.flowNodeCopy}>
                <strong>Dashboard จังหวัด</strong>
                <span>กำกับ ติดตาม และนำข้อมูลกลับมาใช้</span>
              </div>
            </div>

            <div className={`${styles.flowNode} ${styles.centralNode}`}>
              <div className={styles.flowNodeIcon}><CloudUpload aria-hidden="true" size={23} /></div>
              <div className={styles.flowNodeCopy}>
                <strong>HDC / สปสช.</strong>
                <span>ระบบประมวลผลส่วนกลาง</span>
              </div>
            </div>

            <div className={styles.flowRouteLabel}>ส่งข้อมูลเข้าสู่ระบบส่วนกลาง</div>
            <div className={styles.flowCompareLabel}>เทียบเคียง / สอดคล้อง</div>

            <div className={styles.flowLegend}>
              <span><i />เส้นทาง Data Hub ระดับอำเภอ</span>
              <span><i className={styles.flowLegendSecondary} />เส้นทาง HDC / สปสช.</span>
            </div>
          </div>

          <SlideFooter />
        </div>
      </section>

      <section id="5" className={`${styles.slide} ${styles.outcome}`}>
        <SlideMeta number="05 / 06" />
        <div className={styles.visual}>
          <Image
            src="/slide/slide4-dashboard-bright.png"
            alt="Dashboard ข้อมูลสุขภาพที่สว่าง สดใส และพร้อมนำข้อมูลไปใช้งาน"
            fill
            sizes="(max-width: 900px) 100vw, 486px"
          />
        </div>
        <div className={styles.content}>
          <Kicker icon={Flag}>เป้าหมายปลายทาง</Kicker>
          <h2>ผลที่คาดว่าจะได้รับในปีงบ 2570</h2>
          <div className={styles.items}>
            {outcomeItems.map((item) => (
              <SlideItem key={item.title} {...item} />
            ))}
          </div>
          <SlideFooter />
        </div>
      </section>

      <section id="6" className={`${styles.slide} ${styles.progress}`}>
        <SlideMeta number="06 / 06" />
        <div className={`${styles.content} ${styles.progressContent}`}>
          <Kicker icon={ListTodo}>แผนการดำเนินงาน</Kicker>
          <h2>ความก้าวหน้าการดำเนินงาน</h2>
          <div className={styles.progressTable} role="table" aria-label="ความก้าวหน้าการดำเนินงาน">
            <div className={`${styles.progressRow} ${styles.progressHeader}`} role="row">
              <div role="columnheader">#</div>
              <div role="columnheader">กิจกรรม</div>
              <div role="columnheader">ระยะเวลา</div>
              <div role="columnheader">สถานะ</div>
            </div>
            {progressRows.map((row) => (
              <div
                key={row.activity}
                className={`${styles.progressRow} ${row.done ? styles.done : ""}`}
                role="row"
              >
                <div className={styles.progressBullet} role="cell">•</div>
                <div className={styles.progressActivity} role="cell">{row.activity}</div>
                <div className={styles.progressPeriod} role="cell">{row.period}</div>
                <div className={styles.progressStatus} role="cell">
                  {row.done ? (
                    <>
                      <CheckSquare2 aria-hidden="true" size={17} />
                      ดำเนินการแล้ว
                    </>
                  ) : (
                    <Square aria-label="ยังไม่ดำเนินการ" size={17} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <SlideFooter />
        </div>
      </section>
    </main>
  );
}
