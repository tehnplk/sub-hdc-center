import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RapidReportView } from '../_lib/RapidReportView';

export const metadata: Metadata = {
  title: 'MMR2',
  description: 'ความครอบคลุมวัคซีนป้องกันหัด-คางทูม-หัดเยอรมัน เข็มที่ 2',
};

export default function RapidMmr2Page() {
  return (
    <Suspense>
      <RapidReportView
        reportId="52"
        fallbackTitle="ความครอบคลุมวัคซีนป้องกันหัด-คางทูม-หัดเยอรมัน เข็มที่ 2 (MMR2)"
      />
    </Suspense>
  );
}
