import { redirect } from 'next/navigation';

// หน้านี้ย้ายไปที่ /rapid แล้ว — redirect ถาวร
export default function ServiceCountPage() {
  redirect('/rapid');
}
