import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RapidReportView } from '../_lib/RapidReportView';

export const metadata: Metadata = {
  title: 'คัดกรองความดันโลหิตสูง',
  description: 'ประชาชนอายุ 35 ปีขึ้นไปได้รับการคัดกรอง และเสี่ยงต่อโรคความดันโลหิตสูง',
};

export default function RapidScreenHtPage() {
  return (
    <Suspense>
      <RapidReportView
        reportId="276"
        fallbackTitle="ประชาชนอายุ 35 ปี ขึ้นไปได้รับการคัดกรอง และเสี่ยงต่อโรคความดันโลหิตสูง"
      />
    </Suspense>
  );
}
