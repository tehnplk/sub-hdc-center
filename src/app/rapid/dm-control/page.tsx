import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RapidReportView } from '../_lib/RapidReportView';

export const metadata: Metadata = {
  title: 'DM Control',
  description: 'ผู้ป่วยโรคเบาหวานควบคุมระดับน้ำตาลได้ดี',
};

export default function RapidDmControlPage() {
  return (
    <Suspense>
      <RapidReportView reportId="143" fallbackTitle="ผู้ป่วยโรคเบาหวานควบคุมระดับน้ำตาลได้ดี (DM Control)" />
    </Suspense>
  );
}
