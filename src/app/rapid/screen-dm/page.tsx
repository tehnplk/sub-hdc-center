import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RapidReportView } from '../_lib/RapidReportView';

export const metadata: Metadata = {
  title: 'คัดกรองเบาหวาน',
  description: 'ประชาชนอายุ 35 ปีขึ้นไปได้รับการคัดกรอง และเสี่ยงต่อโรคเบาหวาน',
};

export default function RapidScreenDmPage() {
  return (
    <Suspense>
      <RapidReportView
        reportId="275"
        fallbackTitle="ประชาชนอายุ 35 ปี ขึ้นไปได้รับการคัดกรอง และเสี่ยงต่อโรคเบาหวาน"
      />
    </Suspense>
  );
}
